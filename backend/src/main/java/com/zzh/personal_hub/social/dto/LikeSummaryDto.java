package com.zzh.personal_hub.social.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeSummaryDto {
    private long likeCount;
    private boolean liked;
}
