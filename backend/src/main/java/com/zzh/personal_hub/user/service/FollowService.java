package com.zzh.personal_hub.user.service;

import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.common.response.PageResult;
import com.zzh.personal_hub.user.dto.UserSummaryDto;
import com.zzh.personal_hub.user.entity.Follow;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.repository.FollowRepository;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    /** 当前登录用户关注 followeeId（幂等） */
    @Transactional
    public void follow(Long followeeId) {
        User me = currentUser();
        assertUserExists(followeeId);
        if (me.getId().equals(followeeId)) {
            throw new BusinessException(400, "不能关注自己");
        }
        if (followRepository.existsByFollowerIdAndFolloweeId(me.getId(), followeeId)) {
            return;
        }
        Follow follow = new Follow();
        follow.setFollowerId(me.getId());
        follow.setFolloweeId(followeeId);
        followRepository.save(follow);
    }

    /** 取消关注（幂等） */
    @Transactional
    public void unfollow(Long followeeId) {
        User me = currentUser();
        followRepository.deleteByFollowerIdAndFolloweeId(me.getId(), followeeId);
    }

    public boolean isFollowing(Long followerId, Long followeeId) {
        return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
    }

    public long getFollowerCount(Long userId) {
        return followRepository.countByFolloweeId(userId);
    }

    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    public boolean isFollowedByCurrentUser(Long followeeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            return false;
        }
        if ("anonymousUser".equals(auth.getName())) {
            return false;
        }
        return userRepository
                .findByUsername(auth.getName())
                .map(me -> !me.getId().equals(followeeId) && isFollowing(me.getId(), followeeId))
                .orElse(false);
    }

    /** 粉丝列表：关注了 userId 的人 */
    @Transactional(readOnly = true)
    public PageResult<UserSummaryDto> listFollowers(Long userId, int page, int size) {
        assertUserExists(userId);
        PageRequest pageable = PageRequest.of(normalizePage(page), normalizeSize(size));
        Page<Follow> result = followRepository.findByFolloweeIdOrderByCreatedAtDesc(userId, pageable);
        List<UserSummaryDto> items = new ArrayList<>();
        for (Follow follow : result.getContent()) {
            toSummary(follow.getFollowerId()).ifPresent(items::add);
        }
        return new PageResult<>(items, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    /** 关注列表：userId 关注的人 */
    @Transactional(readOnly = true)
    public PageResult<UserSummaryDto> listFollowing(Long userId, int page, int size) {
        assertUserExists(userId);
        PageRequest pageable = PageRequest.of(normalizePage(page), normalizeSize(size));
        Page<Follow> result = followRepository.findByFollowerIdOrderByCreatedAtDesc(userId, pageable);
        List<UserSummaryDto> items = new ArrayList<>();
        for (Follow follow : result.getContent()) {
            toSummary(follow.getFolloweeId()).ifPresent(items::add);
        }
        return new PageResult<>(items, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    private java.util.Optional<UserSummaryDto> toSummary(Long userId) {
        return userRepository.findById(userId).map(user -> {
            UserProfile profile = userProfileRepository.findById(userId).orElse(null);
            String nickname = profile != null && profile.getNickname() != null
                    ? profile.getNickname()
                    : user.getUsername();
            String avatarUrl = profile != null ? profile.getAvatarUrl() : null;
            return new UserSummaryDto(user.getId(), user.getUsername(), nickname, avatarUrl);
        });
    }

    private int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private int normalizeSize(int size) {
        if (size < 1) {
            return 20;
        }
        return Math.min(size, 50);
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new BusinessException(401, "未登录或登录已失效");
        }
        return userRepository
                .findByUsername(auth.getName())
                .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
    }

    private void assertUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(404, "用户不存在");
        }
    }
}
