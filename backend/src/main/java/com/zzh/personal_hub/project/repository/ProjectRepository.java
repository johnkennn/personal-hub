package com.zzh.personal_hub.project.repository;

import com.zzh.personal_hub.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;
import java.time.Instant;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc();

    Optional<Project> findByIdAndPublishedTrueAndDeletedAtIsNull(Long id);

    List<Project> findAllByOrderByUpdatedAtDesc();

    List<Project> findByAuthorIdAndPublishedFalseAndDeletedAtIsNullOrderByUpdatedAtDesc(Long authorId);

    List<Project> findByAuthorIdAndPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc(Long authorId);

    List<Project> findByAuthorIdInAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(
            Collection<Long> authorIds);

    List<Project> findByNameContainingAndPublishedTrueAndDeletedAtIsNullOrderByCreatedAtDesc(String name);

    long countByPublishedTrueAndDeletedAtIsNull();

    List<Project> findByDeletedAtNotNullAndDeletedAtBefore(Instant cutoff);

    List<Project> findByDeletedAtNotNullOrderByDeletedAtDesc();

    long countByDeletedAtNotNull();
}
