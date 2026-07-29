package com.zzh.personal_hub.auth.service;

import com.zzh.personal_hub.auth.dto.LoginRequest;
import com.zzh.personal_hub.auth.dto.LoginResponse;
import com.zzh.personal_hub.auth.entity.AdminUser;
import com.zzh.personal_hub.auth.repository.AdminUserRepository;
import com.zzh.personal_hub.auth.jwt.JwtService;
import com.zzh.personal_hub.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public LoginResponse login(LoginRequest request) {
        AdminUser user = adminUserRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        String token = jwtService.generateToken(user.getUsername());
        return new LoginResponse(user.getUsername(), token);
    }
}