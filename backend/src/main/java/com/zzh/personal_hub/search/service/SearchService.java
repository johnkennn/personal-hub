package com.zzh.personal_hub.search.service;

import com.zzh.personal_hub.blog.entity.Article;
import com.zzh.personal_hub.blog.repository.ArticleRepository;
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
        // 1) 规范化关键词：null / 空白 → 直接空结果
        if (q == null || q.isBlank()) {
            return List.of();
        }
        String keyword = q.trim();

        // 2) 分别搜文章、项目（过滤条件已在 Repository）
        List<Article> articles = articleRepository
                .findByTitleContainingAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(keyword);
        List<Project> projects = projectRepository
                .findByNameContainingAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(keyword);

        // 3) 批量查作者，避免循环里 findById（N+1）——和 Feed 同款手法
        Set<Long> authorIds = articles.stream().map(Article::getAuthorId).collect(Collectors.toSet());
        projects.forEach(p -> authorIds.add(p.getAuthorId()));
        Map<Long, User> authors = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // 4) 映射成统一卡片
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
                0));
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
                0));
        }

        // 5) 混合后再按时间排（否则会先全是文章再全是项目）
        items.sort(Comparator.comparing(FeedItemDto::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }
}