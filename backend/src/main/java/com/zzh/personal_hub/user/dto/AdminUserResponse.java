package com.zzh.personal_hub.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.zzh.personal_hub.user.entity.UserRole;
import com.zzh.personal_hub.user.entity.UserStatus;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private Instant createdAt;
    private UserStatus status;
}
