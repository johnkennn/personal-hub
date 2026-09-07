package com.zzh.personal_hub.social.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.zzh.personal_hub.social.entity.ContentLike;
import com.zzh.personal_hub.social.ContentTargetType;
import java.util.Optional;
import java.util.Collection;
import java.util.List;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {
    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, ContentTargetType type, Long targetId);
    long countByTargetTypeAndTargetId(ContentTargetType type, Long targetId);
    Optional<ContentLike> findByUserIdAndTargetTypeAndTargetId(Long userId, ContentTargetType type, Long targetId);
    void deleteByUserIdAndTargetTypeAndTargetId(Long userId, ContentTargetType type, Long targetId);
    List<ContentLike> findByTargetTypeAndTargetIdIn(
        ContentTargetType type, Collection<Long> targetIds);

    @Modifying(clearAutomatically = true)
    @Query("delete from ContentLike l where l.targetType = :type and l.targetId = :targetId")
    int deleteByTargetTypeAndTargetId(
        @Param("type") ContentTargetType type, @Param("targetId") Long targetId);
}
