package com.zzh.personal_hub.social.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.ContentTargetType;
import java.util.List;
import java.time.Instant;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTargetTypeAndTargetIdAndDeletedAtIsNullOrderByCreatedAtDesc(ContentTargetType targetType, Long targetId);
    List<Comment> findByDeletedAtIsNullOrderByCreatedAtDesc();
    long countByDeletedAtIsNull();

    List<Comment> findByDeletedAtNotNullAndDeletedAtBefore(Instant cutoff);

    @Modifying(clearAutomatically = true)
    @Query("delete from Comment c where c.targetType = :type and c.targetId = :targetId")
    int deleteByTargetTypeAndTargetId(
            @Param("type") ContentTargetType type, @Param("targetId") Long targetId);
}
