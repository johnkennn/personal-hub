package com.zzh.personal_hub.auth.service;

import com.zzh.personal_hub.auth.dto.LoginRequest;
import com.zzh.personal_hub.auth.dto.RegisterRequest;
import com.zzh.personal_hub.auth.dto.LoginResponse;
import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.entity.UserStatus;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.auth.jwt.JwtService;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        // 1) 从 users 表按用户名查找
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));
    
        // 2) 禁用账号单独处理（和「密码错」区分开，方便前端提示）
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new BusinessException(403, "账号已禁用");
        }
    
        // 3) 明文 vs 库里的 BCrypt 哈希
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }
    
        // 4) 发令牌（和注册成功时一样）
        String token = jwtService.generateToken(user.getUsername());
        return new LoginResponse(user.getUsername(), token);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(400, "用户名已存在");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(400, "邮箱已被注册");
        }
    
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        // role / status 用实体默认值 AUTHOR + ACTIVE 即可
        userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);                 // 不要手动 setUserId，交给 @MapsId
        profile.setNickname(user.getUsername()); // 默认昵称 = 用户名，以后可改
        profile.setBio("这个人很懒，什么都没有留下");
        profile.setAvatarUrl("https://unpkg.com/@lobehub/icons-static-svg@1.79.0/icons/lobehub-color.svg");
        profile.setLinksJson("{}");
        userProfileRepository.save(profile);

        // 注册成功后直接发 JWT，前端少调一次登录（体验更好）
        String token = jwtService.generateToken(user.getUsername());
        return new LoginResponse(user.getUsername(), token);
    }
}