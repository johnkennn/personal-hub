package com.zzh.personal_hub.article.service;

import com.zzh.personal_hub.article.dto.ArticleCreateRequest;
import com.zzh.personal_hub.article.dto.ArticleUpdateRequest;
import com.zzh.personal_hub.article.entity.Article;
import com.zzh.personal_hub.article.entity.ArticleToolEntity;
import com.zzh.personal_hub.article.repository.ArticleRepository;
import com.zzh.personal_hub.article.repository.ArticleToolRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.media.MediaStorageService;
import com.zzh.personal_hub.notification.service.NotificationService;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.tool.entity.Tool;
import com.zzh.personal_hub.tool.repository.ToolRepository;
import com.zzh.personal_hub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private static final int MAX_RELATED_TOOLS = 10;

    private final ArticleRepository articleRepository;
    private final ArticleToolRepository articleToolRepository;
    private final ToolRepository toolRepository;
    private final CurrentUserService currentUserService;
    private final MediaStorageService mediaStorageService;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;

    public List<Article> listPublished() {
        return attachRelatedTools(
                articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc());
    }

    public Article getPublishedById(Long id) {
        Article article = articleRepository
                .findByIdAndPublishedTrueAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        return attachRelatedTools(article);
    }

    @Transactional
    public Article createArticle(ArticleCreateRequest request) {
        User me = currentUserService.requireUser();

        Article article = new Article();
        article.setAuthorId(me.getId());
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setPublished(Boolean.TRUE.equals(request.getPublished()));
        article.setCreatedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        applyRelatedProject(article, request.getRelatedProjectId());
        article = articleRepository.save(article);
        replaceRelatedTools(article.getId(), request.getRelatedToolSlugs());
        return attachRelatedTools(article);
    }

    @Transactional
    public Article updateArticle(Long id, ArticleUpdateRequest request) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        if (Boolean.TRUE.equals(article.getPublished())) {
            if (Boolean.TRUE.equals(request.getPublished())) {
                throw new BusinessException(400, "已发布内容不可编辑，请先下架");
            }
            article.setPublished(false);
            article.setUpdatedAt(Instant.now());
            return attachRelatedTools(articleRepository.save(article));
        }
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setPublished(request.getPublished());
        article.setUpdatedAt(Instant.now());
        applyRelatedProject(article, request.getRelatedProjectId());
        article = articleRepository.save(article);
        if (request.getRelatedToolSlugs() != null) {
            replaceRelatedTools(article.getId(), request.getRelatedToolSlugs());
        }
        return attachRelatedTools(article);
    }

    public void deleteArticle(Long id) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        article.setDeletedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
    }

    public List<Article> listMyDrafts() {
        User me = currentUserService.requireUser();
        return attachRelatedTools(
                articleRepository.findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId()));
    }

    public List<Article> listMyPublished() {
        User me = currentUserService.requireUser();
        return attachRelatedTools(
                articleRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId()));
    }

    public List<Article> listAll() {
        return attachRelatedTools(articleRepository.findAllByOrderByUpdatedAtDesc());
    }

    public List<Article> listAllForAdmin() {
        currentUserService.requireAdmin();
        return attachRelatedTools(
                articleRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc());
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        currentUserService.requireAdmin();
        Article article = getActiveForAdmin(id);
        article.setDeletedAt(Instant.now());
        article.setUpdatedAt(Instant.now());
        articleRepository.save(article);
    }

    @Transactional
    public Article uploadCover(Long id, MultipartFile file) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        if (Boolean.TRUE.equals(article.getPublished())) {
            throw new BusinessException(400, "已发布内容不可编辑，请先下架");
        }

        String url = mediaStorageService.saveImage(file, "covers/articles/" + id);
        article.setCoverUrl(url);
        article.setUpdatedAt(Instant.now());
        return attachRelatedTools(articleRepository.save(article));
    }

    private Article getActiveForAdmin(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        if (article.getDeletedAt() != null || !Boolean.TRUE.equals(article.getPublished())) {
            throw new BusinessException(404, "文章不存在");
        }
        return article;
    }

    public Article getMyArticle(Long id) {
        Article article = articleRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));
        currentUserService.assertOwner(article.getAuthorId(), "无权操作该文章");
        if (article.getDeletedAt() != null) {
            throw new BusinessException(404, "文章不存在");
        }
        return attachRelatedTools(article);
    }

    public int batchPublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), meId)) continue;
            if (Boolean.TRUE.equals(a.getPublished())) continue;
            a.setPublished(true);
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public int batchUnpublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), meId)) continue;
            if (!Boolean.TRUE.equals(a.getPublished())) continue;
            a.setPublished(false);
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public int batchDelete(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Article a = articleRepository.findById(id).orElse(null);
            if (a == null || a.getDeletedAt() != null) continue;
            if (!Objects.equals(a.getAuthorId(), meId)) continue;
            a.setDeletedAt(Instant.now());
            a.setUpdatedAt(Instant.now());
            articleRepository.save(a);
            n++;
        }
        return n;
    }

    public List<Article> listPublishedByAuthor(Long authorId) {
        return attachRelatedTools(
                articleRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(authorId));
    }

    @Transactional
    public Article unpublishByAdmin(Long id) {
        User admin = currentUserService.requireAdmin();
        Article article = getActiveForAdmin(id);
        article.setPublished(false);
        article.setUpdatedAt(Instant.now());
        article = articleRepository.save(article);
        notificationService.notifyUnpublishByAdmin(
                admin.getId(), article.getAuthorId(), "ARTICLE", article.getId());
        return attachRelatedTools(article);
    }

    private void applyRelatedProject(Article article, Long relatedProjectId) {
        if (relatedProjectId == null) {
            article.setRelatedProjectId(null);
            return;
        }
        var project = projectRepository.findById(relatedProjectId)
                .orElseThrow(() -> new BusinessException(400, "关联项目不存在"));
        if (project.getDeletedAt() != null) {
            throw new BusinessException(400, "关联项目不存在");
        }
        if (!Objects.equals(project.getAuthorId(), article.getAuthorId())) {
            throw new BusinessException(400, "只能关联自己的项目");
        }
        article.setRelatedProjectId(relatedProjectId);
    }

    public List<Article> listPublishedByRelatedProject(Long projectId) {
        return attachRelatedTools(
                articleRepository.findByRelatedProjectIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(projectId));
    }

    /** 某工具下已发布的关联评测 */
    public List<Article> listPublishedByToolSlug(String slug) {
        Tool tool = toolRepository.findBySlugAndPublishedTrueAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new BusinessException(404, "工具不存在"));
        List<ArticleToolEntity> links = articleToolRepository.findByToolIdOrderBySortOrderAscArticleIdAsc(tool.getId());
        if (links.isEmpty()) {
            return List.of();
        }
        List<Long> articleIds = links.stream().map(ArticleToolEntity::getArticleId).distinct().toList();
        Map<Long, Article> byId = articleRepository.findAllById(articleIds).stream()
                .filter(a -> a.getDeletedAt() == null && Boolean.TRUE.equals(a.getPublished()))
                .collect(Collectors.toMap(Article::getId, a -> a, (a, b) -> a, LinkedHashMap::new));
        List<Article> ordered = new ArrayList<>();
        for (Long aid : articleIds) {
            Article a = byId.get(aid);
            if (a != null) ordered.add(a);
        }
        return attachRelatedTools(ordered);
    }

    private void replaceRelatedTools(Long articleId, List<String> slugs) {
        articleToolRepository.deleteByArticleId(articleId);
        if (slugs == null || slugs.isEmpty()) {
            return;
        }
        List<String> cleaned = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String raw : slugs) {
            if (raw == null) continue;
            String s = raw.trim();
            if (s.isEmpty() || !seen.add(s)) continue;
            cleaned.add(s);
            if (cleaned.size() >= MAX_RELATED_TOOLS) break;
        }
        if (cleaned.isEmpty()) return;

        List<Tool> tools = toolRepository.findBySlugInAndDeletedAtIsNull(cleaned);
        Map<String, Tool> bySlug = tools.stream()
                .collect(Collectors.toMap(Tool::getSlug, t -> t, (a, b) -> a));
        List<ArticleToolEntity> rows = new ArrayList<>();
        int order = 0;
        for (String slug : cleaned) {
            Tool tool = bySlug.get(slug);
            if (tool == null) {
                throw new BusinessException(400, "关联工具不存在：" + slug);
            }
            ArticleToolEntity row = new ArticleToolEntity();
            row.setArticleId(articleId);
            row.setToolId(tool.getId());
            row.setSortOrder(order++);
            rows.add(row);
        }
        articleToolRepository.saveAll(rows);
    }

    private Article attachRelatedTools(Article article) {
        attachRelatedTools(List.of(article));
        return article;
    }

    private List<Article> attachRelatedTools(List<Article> articles) {
        if (articles == null || articles.isEmpty()) {
            return articles == null ? List.of() : articles;
        }
        List<Long> ids = articles.stream().map(Article::getId).filter(Objects::nonNull).toList();
        if (ids.isEmpty()) {
            for (Article a : articles) {
                a.setRelatedToolSlugs(List.of());
            }
            return articles;
        }
        List<ArticleToolEntity> links =
                articleToolRepository.findByArticleIdInOrderBySortOrderAscToolIdAsc(ids);
        Set<Long> toolIds = links.stream().map(ArticleToolEntity::getToolId).collect(Collectors.toSet());
        Map<Long, String> toolIdToSlug = toolIds.isEmpty()
                ? Map.of()
                : toolRepository.findAllById(toolIds).stream()
                        .collect(Collectors.toMap(Tool::getId, Tool::getSlug, (a, b) -> a));

        Map<Long, List<String>> byArticle = new HashMap<>();
        for (ArticleToolEntity link : links) {
            String slug = toolIdToSlug.get(link.getToolId());
            if (slug == null) continue;
            byArticle.computeIfAbsent(link.getArticleId(), k -> new ArrayList<>()).add(slug);
        }
        for (Article a : articles) {
            a.setRelatedToolSlugs(byArticle.getOrDefault(a.getId(), List.of()));
        }
        return articles;
    }
}
