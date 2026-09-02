package com.zzh.personal_hub.auth;

import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserProfile;
import com.zzh.personal_hub.user.entity.UserRole;
import com.zzh.personal_hub.user.entity.UserStatus;
import com.zzh.personal_hub.user.repository.UserRepository;
import com.zzh.personal_hub.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap-password:}")
    private String bootstrapPassword;

    @Override
    public void run(ApplicationArguments args) {
        // 已有管理员则跳过
        boolean hasAdmin = userRepository.existsByRole(UserRole.ADMIN);
        if (hasAdmin) {
            return;
        }

        if (!StringUtils.hasText(bootstrapPassword)) {
            log.warn("未配置 app.admin.bootstrap-password，跳过默认管理员初始化");
            return;
        }

        // 若已有同名普通用户，不要覆盖成 ADMIN（避免误伤）
        if (userRepository.existsByUsername("admin")) {
            log.warn("用户名 admin 已存在且不是 ADMIN，请手动提升角色或换引导用户名");
            return;
        }

        Instant now = Instant.now();
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@local.dev");
        admin.setPasswordHash(passwordEncoder.encode(bootstrapPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setCreatedAt(now);
        admin.setUpdatedAt(now);
        userRepository.save(admin);
        UserProfile profile = new UserProfile();
        profile.setUser(admin);
        profile.setNickname("管理员");
        profile.setBio("");
        profile.setAvatarUrl(null);
        profile.setLinksJson("{}");
        userProfileRepository.save(profile);

        log.info("已初始化默认管理员账号: admin");
    }
}