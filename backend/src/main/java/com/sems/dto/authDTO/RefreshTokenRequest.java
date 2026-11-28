package com.sems.dto.authDTO;

import jakarta.validation.constraints.NotBlank;

/** Dùng cho cả /auth/refresh và /auth/logout. */
public record RefreshTokenRequest(
        @NotBlank(message = "refreshToken không được để trống") String refreshToken
) {
}
