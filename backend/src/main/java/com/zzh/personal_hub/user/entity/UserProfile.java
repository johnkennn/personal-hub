package com.zzh.personal_hub.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long userId;

    /** 拥有这份资料的用户；主键与外键同一列 */
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 64)
    private String nickname;

    @Column(length = 512)
    private String bio;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    /** 先用字符串存 JSON，例如 {"github":"https://..."}；以后再演进 */
    @Column(name = "links_json", length = 1024)
    private String linksJson;
}
