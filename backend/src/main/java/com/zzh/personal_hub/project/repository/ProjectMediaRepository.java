package com.zzh.personal_hub.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zzh.personal_hub.project.entity.ProjectMedia;

public interface ProjectMediaRepository extends JpaRepository<ProjectMedia, Long> {

    List<ProjectMedia> findByProjectIdOrderBySortOrderAscIdAsc(Long projectId);
    
    long countByProjectId(Long projectId);

    Optional<ProjectMedia> findByIdAndProjectId(Long id, Long projectId);
}
