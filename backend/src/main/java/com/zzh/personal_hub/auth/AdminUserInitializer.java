package com.zzh.personal_hub.auth;

import com.zzh.personal_hub.auth.entity.AdminUser;
import com.zzh.personal_hub.auth.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        // 本地开发密码：请改成你自己记得住的；上线绝不能用弱密码写死在代码里
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        adminUserRepository.save(admin);

        log.info("已初始化默认管理员账号: admin");
    }
}