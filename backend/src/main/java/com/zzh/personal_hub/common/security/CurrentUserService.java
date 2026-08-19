package com.zzh.personal_hub.common.security;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.common.exception.BusinessException;
import com.zzh.personal_hub.user.entity.UserRole;
import com.zzh.personal_hub.user.entity.UserStatus;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    /**
     * 必须已登录。Controller / 写操作使用。
     */
    public User requireUser() {
        Authentication auth = authenticationOrNull();
        if(auth == null){
            throw new BusinessException(401, "未登录或登录已失效");
        }
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new BusinessException(401, "未登录或用户不存在"));
        if(user.getStatus() == UserStatus.DISABLED){
            throw new BusinessException(403, "账号已禁用");
        }
        return user;
    }
    
    /**
     * 可匿名。公开读接口用来填 liked=true/false。
     * 未登录 → empty，不要抛 401。
     */
    public java.util.Optional<User> findUser() {
        Authentication auth = authenticationOrNull();
        if(auth == null){
            return java.util.Optional.empty();
        }
        return userRepository.findByUsername(auth.getName());
    }

    public Long findUserIdOrNull() {
        return findUser().map(User::getId).orElse(null);
    }

    /** 必须登录且 role=ADMIN */
    public User requireAdmin() {
        User user = requireUser();
        if(!UserRole.ADMIN.equals(user.getRole())){
            throw new BusinessException(403, "需要管理员权限");
        }
        return user;
    }

    /**
     * 资源作者必须是当前用户。
     * ownerId：文章/项目的 authorId，评论/建议的 userId。
     */
    public void assertOwner(Long ownerId,String forbiddenMessage) {
        User user = requireUser();
        if(!Objects.equals(user.getId(), ownerId)){
            throw new BusinessException(403, forbiddenMessage);
        }
    }

    /** 未登录 / 匿名占位 → null */
    private Authentication authenticationOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !auth.isAuthenticated() || auth.getName() == null || "anonymousUser".equals(auth.getName())){
            return null;
        }
        return auth;
    }
}
