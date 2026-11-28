package com.sems.dto.authDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email chưa đúng định dạng")
        String email
) {
}
