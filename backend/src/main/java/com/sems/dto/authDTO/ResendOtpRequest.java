package com.sems.dto.authDTO;

import com.sems.entity.OtpPurpose;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** purpose có thể bỏ trống, mặc định VERIFY_EMAIL. */
public record ResendOtpRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email chưa đúng định dạng")
        String email,

        OtpPurpose purpose
) {
}
