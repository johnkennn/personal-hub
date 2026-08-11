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
    /** 粉丝数（有多少人关注了我） */
    private long followerCount;
    /** 关注数（我关注了多少人） */
    private long followingCount;
    /** 当前登录用户是否已关注该用户；未登录则为 false */
    private boolean following;
}
