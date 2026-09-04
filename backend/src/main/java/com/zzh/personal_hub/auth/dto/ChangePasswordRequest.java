package com.zzh.personal_hub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    
    @NotBlank @Size(min = 6, max = 72)
    private String oldPassword;

    @NotBlank @Size(min = 6, max = 72)
    private String newPassword;
}
