package com.zzh.personal_hub.deal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealResponse {
    private Long id;
    private String title;
    private String description;
    private String promoCode;
    private String url;
    private Instant startsAt;
    private Instant endsAt;
    private String status;
    private Long toolId;
    private String toolSlug;
    private String toolName;
    private Instant createdAt;
    private Instant updatedAt;
}
