package com.zzh.personal_hub.feed.service;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.social.entity.ContentLike;
import com.zzh.personal_hub.social.repository.ContentLikeRepository;
import com.zzh.personal_hub.user.entity.Follow;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.repository.FollowRepository;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FollowRepository followRepository;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CurrentUserService currentUserService;
    private final ContentLikeRepository contentLikeRepository;

    public List<FeedItemDto> listFollowingFeed() {
        User me = currentUserService.requireUser();

        List<Long> followeeIds = followRepository.findByFollowerId(me.getId()).stream()
                .map(Follow::getFolloweeId)
                .toList();

        if (followeeIds.isEmpty()) {
            return List.of();
        }

        List<Article> articles = articleRepository
                .findByAuthorIdInAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(followeeIds);
        List<Project> projects = projectRepository
                .findByAuthorIdInAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(followeeIds);

        AuthorBundle authors = loadAuthors(articles, projects);
        Map<Long, Long> articleLikes = countLikes(
                ContentTargetType.ARTICLE, articles.stream().map(Article::getId).toList());
        Map<Long, Long> projectLikes = countLikes(
                ContentTargetType.PROJECT, projects.stream().map(Project::getId).toList());

        List<FeedItemDto> items = new ArrayList<>();
        for (Article a : articles) {
            items.add(toArticleItem(a, authors, articleLikes.getOrDefault(a.getId(), 0L)));
        }
        for (Project p : projects) {
            items.add(toProjectItem(p, authors, projectLikes.getOrDefault(p.getId(), 0L)));
        }

        items.sort(Comparator.comparing(FeedItemDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }

    /**
     * 全站最新混合流（公开）。
     * @param limit 最多返回条数；&lt;=0 时用默认 50；上限封顶 100，防止一次拖垮 DB
     */
    public List<FeedItemDto> listLatest(int limit) {
        int size = limit <= 0 ? 50 : Math.min(limit, 100);

        List<Article> articles = articleRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
        List<Project> projects = projectRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();

        AuthorBundle authors = loadAuthors(articles, projects);
        List<FeedItemDto> items = new ArrayList<>();
        for (Article a : articles) {
            items.add(toArticleItem(a, authors, 0L));
        }
        for (Project p : projects) {
            items.add(toProjectItem(p, authors, 0L));
        }

        items.sort(Comparator.comparing(FeedItemDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        if (items.size() > size) {
            return new ArrayList<>(items.subList(0, size));
        }
        return items;
    }

    public List<FeedItemDto> listHot(int limit) {
        int size = limit <= 0 ? 50 : Math.min(limit, 100);

        List<Article> articles = articleRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
        List<Project> projects = projectRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();

        AuthorBundle authors = loadAuthors(articles, projects);
        Map<Long, Long> articleLikeCounts = countLikes(
                ContentTargetType.ARTICLE, articles.stream().map(Article::getId).toList());
        Map<Long, Long> projectLikeCounts = countLikes(
                ContentTargetType.PROJECT, projects.stream().map(Project::getId).toList());

        List<FeedItemDto> items = new ArrayList<>();
        for (Article a : articles) {
            items.add(toArticleItem(a, authors, articleLikeCounts.getOrDefault(a.getId(), 0L)));
        }
        for (Project p : projects) {
            items.add(toProjectItem(p, authors, projectLikeCounts.getOrDefault(p.getId(), 0L)));
        }

        items.sort(Comparator
                .comparingLong(FeedItemDto::getLikeCount).reversed()
                .thenComparing(FeedItemDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())));

        if (items.size() > size) {
            return new ArrayList<>(items.subList(0, size));
        }
        return items;
    }

    private AuthorBundle loadAuthors(List<Article> articles, List<Project> projects) {
        Set<Long> authorIds = new HashSet<>();
        articles.forEach(a -> authorIds.add(a.getAuthorId()));
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> users = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, UserProfile> profiles = userProfileRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, Function.identity(), (a, b) -> a));
        return new AuthorBundle(users, profiles);
    }

    private FeedItemDto toArticleItem(Article a, AuthorBundle authors, long likes) {
        User user = authors.users().get(a.getAuthorId());
        UserProfile profile = authors.profiles().get(a.getAuthorId());
        String username = user != null ? user.getUsername() : "unknown";
        return new FeedItemDto(
                ContentTargetType.ARTICLE,
                a.getId(),
                a.getTitle(),
                a.getAuthorId(),
                username,
                a.getCreatedAt(),
                likes,
                excerptOf(a.getContent(), 120),
                a.getCoverUrl(),
                displayName(username, profile),
                profile != null ? profile.getAvatarUrl() : null);
    }

    private FeedItemDto toProjectItem(Project p, AuthorBundle authors, long likes) {
        User user = authors.users().get(p.getAuthorId());
        UserProfile profile = authors.profiles().get(p.getAuthorId());
        String username = user != null ? user.getUsername() : "unknown";
        return new FeedItemDto(
                ContentTargetType.PROJECT,
                p.getId(),
                p.getName(),
                p.getAuthorId(),
                username,
                p.getCreatedAt(),
                likes,
                excerptOf(p.getDescription(), 120),
                p.getCoverUrl(),
                displayName(username, profile),
                profile != null ? profile.getAvatarUrl() : null);
    }

    private static String displayName(String username, UserProfile profile) {
        if (profile != null && profile.getNickname() != null && !profile.getNickname().isBlank()) {
            return profile.getNickname().trim();
        }
        return username;
    }

    private static String excerptOf(String text, int max) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String normalized = text
                .replaceAll("(?s)```.*?```", " ")
                .replaceAll("(?m)^#{1,6}\\s+", "")
                .replaceAll("[#>*_`~\\[\\]]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.length() <= max) {
            return normalized;
        }
        return normalized.substring(0, max) + "…";
    }

    private Map<Long, Long> countLikes(ContentTargetType type, Collection<Long> targetIds) {
        if (targetIds == null || targetIds.isEmpty()) {
            return Map.of();
        }
        return contentLikeRepository.findByTargetTypeAndTargetIdIn(type, targetIds).stream()
                .collect(Collectors.groupingBy(ContentLike::getTargetId, Collectors.counting()));
    }

    private record AuthorBundle(Map<Long, User> users, Map<Long, UserProfile> profiles) {}
}
