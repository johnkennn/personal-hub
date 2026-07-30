package com.zzh.personal_hub.auth;

import com.zzh.personal_hub.auth.entity.AdminUser;
import com.zzh.personal_hub.auth.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap-password:}")
    private String bootstrapPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        if (!StringUtils.hasText(bootstrapPassword)) {
            log.warn("未配置 app.admin.bootstrap-password，跳过默认管理员初始化");
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode(bootstrapPassword));
        adminUserRepository.save(admin);

        log.info("已初始化默认管理员账号: admin");
    }
}