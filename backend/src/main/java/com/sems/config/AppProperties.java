package com.sems.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Cấu hình tùy chỉnh của SEMS, đọc từ tiền tố "app." trong application.properties. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Otp otp, Login login, Mail mail, Cors cors, Seed seed) {

    public record Jwt(String secret, long accessTokenMinutes, long refreshTokenDays) {
    }

    public record Otp(long ttlMinutes, int maxAttempts, long resendSeconds) {
    }

    public record Login(int maxFailures, long lockMinutes) {
    }

    public record Mail(boolean enabled, String from) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Seed(boolean enabled) {
    }
}
