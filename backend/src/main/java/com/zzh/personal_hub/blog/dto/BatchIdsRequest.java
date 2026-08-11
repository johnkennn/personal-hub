package com.zzh.personal_hub.blog.dto;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class BatchIdsRequest {
    @NotEmpty(message = "ids 不能为空")
    private List<Long> ids;
}
