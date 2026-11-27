package com.sems.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.sems.config.AppProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** Tạo và kiểm tra JWT Access Token (ký HS256). Refresh Token là chuỗi ngẫu nhiên lưu trong DB, không phải JWT. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenMinutes;

    public JwtService(AppProperties props) {
        byte[] secret = props.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("app.jwt.secret (JWT_SECRET) phải dài tối thiểu 32 ký tự");
        }
        this.key = Keys.hmacShaKeyFor(secret);
        this.accessTokenMinutes = props.jwt().accessTokenMinutes();
    }

    public String generateAccessToken(Integer userId, String email, List<String> roles) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    /** Ném JwtException hoặc IllegalArgumentException nếu token sai, hết hạn hoặc bị sửa. */
    public AuthenticatedUser parse(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        List<String> roles = new ArrayList<>();
        Object raw = claims.get("roles");
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                roles.add(String.valueOf(o));
            }
        }
        return new AuthenticatedUser(Integer.valueOf(claims.getSubject()), claims.get("email", String.class), roles);
    }

    public long accessTokenTtlSeconds() {
        return accessTokenMinutes * 60;
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
