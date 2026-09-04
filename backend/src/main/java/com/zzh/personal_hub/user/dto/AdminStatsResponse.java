package com.zzh.personal_hub.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsResponse {

    private long userTotal;
    private long userDisabled;
    private long articlePublished;
    private long projectPublished;
    private long commentActive;
    private long suggestionTotal;
}
