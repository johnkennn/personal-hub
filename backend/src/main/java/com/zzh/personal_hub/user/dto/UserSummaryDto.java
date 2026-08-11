package com.zzh.personal_hub.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** 粉丝/关注列表里的轻量用户卡片 */
@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long userId;
    private String username;
    private String nickname;
    private String avatarUrl;
}
