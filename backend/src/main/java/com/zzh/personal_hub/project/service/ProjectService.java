package com.zzh.personal_hub.project.service;
import com.zzh.personal_hub.project.dto.ProjectCreateRequest;
import com.zzh.personal_hub.project.dto.ProjectUpdateRequest;
import java.time.Instant;
import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.repository.UserRepository;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
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
        User me = currentUser(); // 可把 ArticleService 里同款 currentUser 拷过来，或以后抽公共组件
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
        User me = currentUser();
        Project project = projectRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        assertOwner(project, me);
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
        User me = currentUser();
        Project project = projectRepository
                .findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        assertOwner(project, me);
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
        User me = currentUser();
        return projectRepository.findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    public List<Project> listMyPublished() {
        User me = currentUser();
        return projectRepository.findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(me.getId());
    }

    private void assertOwner(Project project, User me) {
        if (!java.util.Objects.equals(project.getAuthorId(), me.getId())) {
            throw new BusinessException(403, "无权操作该项目");
        }
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new BusinessException(401, "未登录或登录已失效");
        }
        return userRepository
                .findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
    }

    public Project getMyProject(Long id) {
        User me = currentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
        assertOwner(project, me);
        if (project.getDeletedAt() != null) {
            throw new BusinessException(404, "项目不存在");
        }
        return project;
    }

    public int batchPublish(List<Long> ids) {
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!Objects.equals(p.getAuthorId(), me.getId())) continue;
            if (Boolean.TRUE.equals(p.getPublished())) continue; // 已发布跳过
            p.setPublished(true);
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }

    public int batchUnpublish(List<Long> ids) {
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!Objects.equals(p.getAuthorId(), me.getId())) continue;
            if (!Boolean.TRUE.equals(p.getPublished())) continue; // 未发布跳过
            p.setPublished(false);
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }

    public int batchDelete(List<Long> ids) {
        User me = currentUser();
        int n = 0;
        for (Long id : ids) {
            Project p = projectRepository.findById(id).orElse(null);
            if (p == null || p.getDeletedAt() != null) continue;
            if (!Objects.equals(p.getAuthorId(), me.getId())) continue;
            p.setDeletedAt(Instant.now());
            p.setUpdatedAt(Instant.now());
            projectRepository.save(p);
            n++;
        }
        return n;
    }
}