package com.zzh.personal_hub.user.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProfileRequest {
    private String nickname;
    private String bio;
    private String avatarUrl;
    private String linksJson;
}
