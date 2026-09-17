package com.zzh.personal_hub.deal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class DealUpsertRequest {

    @NotBlank(message = "请填写标题")
    @Size(max = 120)
    private String title;

    @NotBlank(message = "请填写说明")
    @Size(max = 1000)
    private String description;

    @Size(max = 64)
    private String promoCode;

    /** 可选；空则前台不展示活动入口 */
    @Size(max = 500)
    private String url;

    @NotNull(message = "请填写开始时间")
    private Instant startsAt;

    @NotNull(message = "请填写结束时间")
    private Instant endsAt;

    /** DRAFT | ACTIVE | ENDED | OFFLINE */
    @NotBlank(message = "请选择状态")
    @Size(max = 16)
    private String status;

    @NotNull(message = "请选择关联产品")
    private Long toolId;
}
