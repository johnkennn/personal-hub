package com.zzh.personal_hub.project.service;

import com.zzh.personal_hub.project.dto.ProjectCreateRequest;
import com.zzh.personal_hub.project.dto.ProjectUpdateRequest;
import com.zzh.personal_hub.media.MediaStorageService;
import com.zzh.personal_hub.common.security.CurrentUserService;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CurrentUserService currentUserService;
    private final MediaStorageService mediaStorageService;

    public List<Project> listPublished() {
        return projectRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    }

    public Project getPublishedById(Long id) {
        return projectRepository
                .findByIdAndPublishedTrueAndDeletedAtIsNull(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
    }

    public Project create(ProjectCreateRequest request) {
        Project project = new Project();
        User me = currentUserService.requireUser(); // 谁登录，谁就是作者
        project.setAuthorId(me.getId());
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setRepoUrl(request.getRepoUrl());
        project.setDemoUrl(request.getDemoUrl());
        project.setPublished(Boolean.TRUE.equals(request.getPublished()));
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    public Project update(Long id, ProjectUpdateRequest request) {
        Project project = projectRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        currentUserService.assertOwner(project.getAuthorId(), "无权操作该项目");
        if (project.getDeletedAt() != null) {
            throw new BusinessException(404, "项目不存在");
        }
        if (Boolean.TRUE.equals(project.getPublished())) {
            if (Boolean.TRUE.equals(request.getPublished())) {
                throw new BusinessException(400, "已发布内容不可编辑，请先下架");
            }
            project.setPublished(false);
            project.setUpdatedAt(Instant.now());
            return projectRepository.save(project);
        }
        // 草稿：再 setName/description/.../published
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setRepoUrl(request.getRepoUrl());
        project.setDemoUrl(request.getDemoUrl());
        project.setPublished(request.getPublished());
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    public void delete(Long id) {
        Project project = projectRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        currentUserService.assertOwner(project.getAuthorId(), "无权操作该项目");
        if (project.getDeletedAt() != null) {
            throw new BusinessException(404, "项目不存在");
        }
        project.setDeletedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
    }

    public List<Project> listAll() {
        return projectRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<Project> listMyDrafts() {
        User me = currentUserService.requireUser();
        return projectRepository.findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    public List<Project> listMyPublished() {
        User me = currentUserService.requireUser();
        return projectRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    public Project getMyProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        currentUserService.assertOwner(project.getAuthorId(), "无权操作该项目");
        if (project.getDeletedAt() != null) {
            throw new BusinessException(404, "项目不存在");
        }
        return project;
    }

    @Transactional
    public Project uploadCover(Long id, MultipartFile file) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        currentUserService.assertOwner(project.getAuthorId(), "无权操作该项目");
        if (project.getDeletedAt() != null) {
            throw new BusinessException(404, "项目不存在");
        }
        if (Boolean.TRUE.equals(project.getPublished())) {
            throw new BusinessException(400, "已发布内容不可编辑，请先下架");
        }

        String url = mediaStorageService.saveImage(file, "covers/projects/" + id);
        project.setCoverUrl(url);
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    public int batchPublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(p.getAuthorId(), meId)) continue;
            if (Boolean.TRUE.equals(p.getPublished())) continue; // 已发布跳过
            p.setPublished(true);
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }

    public int batchUnpublish(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(p.getAuthorId(), meId)) continue;
            if (!Boolean.TRUE.equals(p.getPublished())) continue; // 未发布跳过
            p.setPublished(false);
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }

    public int batchDelete(List<Long> ids) {
        Long meId = currentUserService.requireUser().getId();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!java.util.Objects.equals(p.getAuthorId(), meId)) continue;
            p.setDeletedAt(Instant.now());
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }

    public List<Project> listPublishedByAuthor(Long authorId) {
        return projectRepository
                .findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(authorId);
    }

    public List<Project> listAllForAdmin() {
        currentUserService.requireAdmin();
        return projectRepository.findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();
    }

    @Transactional
    public Project unpublishByAdmin(Long id) {
        currentUserService.requireAdmin();
        Project project = getPublishedForAdmin(id);
        project.setPublished(false);
        project.setUpdatedAt(Instant.now());
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteByAdmin(Long id) {
        currentUserService.requireAdmin();
        Project project = getPublishedForAdmin(id);
        project.setDeletedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
    }

    private Project getPublishedForAdmin(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        if (project.getDeletedAt() != null || !Boolean.TRUE.equals(project.getPublished())) {
            throw new BusinessException(404, "项目不存在");
        }
        return project;
    }
}
