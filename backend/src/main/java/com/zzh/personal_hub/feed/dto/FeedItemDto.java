package com.zzh.personal_hub.feed.dto;

import com.zzh.personal_hub.social.ContentTargetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedItemDto {
    /** ARTICLE 或 PROJECT */
    private ContentTargetType type;
    private Long id;
    /** 文章用 title，项目用 name */
    private String titleOrName;
    private Long authorId;
    private String authorUsername;
    private Instant createdAt;
    /** 点赞数；最新/搜索可先填 0，热门必须填真实值 */
    private long likeCount;
}