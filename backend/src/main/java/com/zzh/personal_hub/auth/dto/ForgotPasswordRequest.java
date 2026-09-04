package com.zzh.personal_hub.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    @Size(max = 128)
    private String email;

    @NotBlank @Size(min = 11, max = 20)
    private String phone;

    @NotBlank @Size(min = 6, max = 72)
    private String newPassword;
}
