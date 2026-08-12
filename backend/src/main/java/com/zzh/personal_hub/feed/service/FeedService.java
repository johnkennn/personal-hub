package com.zzh.personal_hub.feed.service;

import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.repository.ArticleRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.social.entity.ContentLike;
import com.zzh.personal_hub.social.repository.ContentLikeRepository;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.user.entity.Follow;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.repository.FollowRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Collection;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FollowRepository followRepository;
    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ContentLikeRepository contentLikeRepository;

    public List<FeedItemDto> listFollowingFeed() {
        User me = currentUser();

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

        // 一次查出作者用户名，避免 N+1
        Set<Long> authorIds = articles.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> authors = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<FeedItemDto> items = new ArrayList<>();

        for (Article a : articles) {
            User author = authors.get(a.getAuthorId());
            items.add(new FeedItemDto(
                    ContentTargetType.ARTICLE,
                    a.getId(),
                    a.getTitle(),
                    a.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    a.getCreatedAt(),
                0L));
        }

        for (Project p : projects) {
            User author = authors.get(p.getAuthorId());
            items.add(new FeedItemDto(
                    ContentTargetType.PROJECT,
                    p.getId(),
                    p.getName(),
                    p.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    p.getCreatedAt(),
                0L));
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

        // 1) 公开内容：已有 Repository 方法，无需再写
        List<Article> articles = articleRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
        List<Project> projects = projectRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();

        // 2) 批量作者（与 Search / Following 相同反 N+1 手法）
        Set<Long> authorIds = articles.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> authors = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // 3) 映射
        List<FeedItemDto> items = new ArrayList<>();
        for (Article a : articles) {
            User author = authors.get(a.getAuthorId());
            items.add(new FeedItemDto(
                    ContentTargetType.ARTICLE,
                    a.getId(),
                    a.getTitle(),
                    a.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    a.getCreatedAt(),
                0L));
        }
        for (Project p : projects) {
            User author = authors.get(p.getAuthorId());
            items.add(new FeedItemDto(
                    ContentTargetType.PROJECT,
                    p.getId(),
                    p.getName(),
                    p.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    p.getCreatedAt(),
                0L));
        }

        // 4) 混合排序后截断
        items.sort(Comparator.comparing(FeedItemDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        if (items.size() > size) {
            return items.subList(0, size);
            // 注意：subList 是视图；若担心被修改，可写成:
            // return new ArrayList<>(items.subList(0, size));
        }
        return items;
    }

    public List<FeedItemDto> listHot(int limit) {
        int size = limit <= 0 ? 50 : Math.min(limit, 100);
    
        // —— 与 listLatest 相同：先拿公开内容并映射卡片 ——
        List<Article> articles = articleRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
        List<Project> projects = projectRepository
                .findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    
        Set<Long> authorIds = articles.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> authors = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    
        List<Long> articleIds = articles.stream().map(Article::getId).toList();
        List<Long> projectIds = projects.stream().map(Project::getId).toList();
    
        // —— 批量赞数：按类型各查一次，再 group 计数 ——
        Map<Long, Long> articleLikeCounts = countLikes(ContentTargetType.ARTICLE, articleIds);
        Map<Long, Long> projectLikeCounts = countLikes(ContentTargetType.PROJECT, projectIds);
    
        List<FeedItemDto> items = new ArrayList<>();
        for (Article a : articles) {
            User author = authors.get(a.getAuthorId());
            long likes = articleLikeCounts.getOrDefault(a.getId(), 0L);
            items.add(new FeedItemDto(
                    ContentTargetType.ARTICLE,
                    a.getId(),
                    a.getTitle(),
                    a.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    a.getCreatedAt(),
                    likes));
        }
        for (Project p : projects) {
            User author = authors.get(p.getAuthorId());
            long likes = projectLikeCounts.getOrDefault(p.getId(), 0L);
            items.add(new FeedItemDto(
                    ContentTargetType.PROJECT,
                    p.getId(),
                    p.getName(),
                    p.getAuthorId(),
                    author != null ? author.getUsername() : "unknown",
                    p.getCreatedAt(),
                    likes));
        }
    
        // 赞数降序；相同则时间新→旧
        items.sort(Comparator
                .comparingLong(FeedItemDto::getLikeCount).reversed()
                .thenComparing(FeedItemDto::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())));
    
        if (items.size() > size) {
            return new ArrayList<>(items.subList(0, size));
        }
        return items;
    }
    
    /** 某类型下一组 targetId → 赞数 */
    private Map<Long, Long> countLikes(ContentTargetType type, Collection<Long> targetIds) {
        if (targetIds == null || targetIds.isEmpty()) {
            return Map.of();
        }
        return contentLikeRepository.findByTargetTypeAndTargetIdIn(type, targetIds).stream()
                .collect(Collectors.groupingBy(ContentLike::getTargetId, Collectors.counting()));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null
                || "anonymousUser".equals(auth.getName())) {
            throw new BusinessException(401, "未登录或登录已失效");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
    }
}