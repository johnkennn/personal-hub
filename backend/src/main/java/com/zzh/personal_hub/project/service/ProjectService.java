package com.zzh.personal_hub.project.service;

import com.zzh.personal_hub.project.entity.Project;
import com.zzh.personal_hub.project.repository.ProjectRepository;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<Project> listPublished() {
        return projectRepository.findByPublishedTrueOrderByCreatedAtDesc();
    }

    public Project getPublishedById(Long id) {
        return projectRepository
                .findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new BusinessException(404, "项目不存在"));
    }
}