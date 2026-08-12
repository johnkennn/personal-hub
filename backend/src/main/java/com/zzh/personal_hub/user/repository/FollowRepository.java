package com.zzh.personal_hub.user.repository;

import com.zzh.personal_hub.user.entity.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    void deleteByFollowerIdAndFolloweeId(Long followerId, Long followeeId);

    long countByFolloweeId(Long followeeId);

    long countByFollowerId(Long followerId);

    /** 某人的粉丝：followee = 此人 */
    Page<Follow> findByFolloweeIdOrderByCreatedAtDesc(Long followeeId, Pageable pageable);

    /** 某人的关注：follower = 此人 */
    Page<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId, Pageable pageable);

    List<Follow> findByFollowerId(Long followerId);
}
