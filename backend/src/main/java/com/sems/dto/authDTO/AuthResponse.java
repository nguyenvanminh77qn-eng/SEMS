package com.sems.dto.authDTO;

/** expiresIn tính bằng giây, là thời hạn của accessToken. */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
