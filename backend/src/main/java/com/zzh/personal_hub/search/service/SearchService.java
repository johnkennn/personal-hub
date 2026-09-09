package com.zzh.personal_hub.search.service;

import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.feed.dto.FeedItemDto;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.social.ContentTargetType;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ArticleRepository articleRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<FeedItemDto> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        String keyword = q.trim();

        List<Article> articles = articleRepository
                .findByTitleContainingAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(keyword);
        List<Project> projects = projectRepository
                .findByNameContainingAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(keyword);

        Set<Long> authorIds = articles.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> authors = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<FeedItemDto> items = new ArrayList<>();

        for (Article a : articles) {
            User author = authors.get(a.getAuthorId());
            String username = author != null ? author.getUsername() : "unknown";
            items.add(new FeedItemDto(
                    ContentTargetType.ARTICLE,
                    a.getId(),
                    a.getTitle(),
                    a.getAuthorId(),
                    username,
                    a.getCreatedAt(),
                    0L,
                    null,
                    a.getCoverUrl(),
                    username,
                    null));
        }

        for (Project p : projects) {
            User author = authors.get(p.getAuthorId());
            String username = author != null ? author.getUsername() : "unknown";
            items.add(new FeedItemDto(
                    ContentTargetType.PROJECT,
                    p.getId(),
                    p.getName(),
                    p.getAuthorId(),
                    username,
                    p.getCreatedAt(),
                    0L,
                    null,
                    p.getCoverUrl(),
                    username,
                    null));
        }

        items.sort(Comparator.comparing(FeedItemDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }
}
