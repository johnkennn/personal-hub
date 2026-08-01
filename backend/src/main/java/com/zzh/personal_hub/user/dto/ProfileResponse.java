package com.zzh.personal_hub.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileResponse {
    private Long userId;
    private String username;
    private String nickname;
    private String bio;
    private String avatarUrl;
    private String linksJson;
}