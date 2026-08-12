package com.zzh.personal_hub.social.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zzh.personal_hub.social.entity.Comment;
import com.zzh.personal_hub.social.ContentTargetType;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTargetTypeAndTargetIdAndDeletedAtIsNullOrderByCreatedAtDesc(ContentTargetType targetType, Long targetId);
}
