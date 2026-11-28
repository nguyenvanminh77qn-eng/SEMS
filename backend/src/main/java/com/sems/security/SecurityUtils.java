package com.sems.security;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.sems.common.exception.BusinessException;

/** Lấy tài khoản hiện tại từ Security Context (dùng chung cho mọi module). */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static AuthenticatedUser requireCurrentUser() {
        return currentUser().orElseThrow(
                () -> new BusinessException(HttpStatus.UNAUTHORIZED, "Chưa xác thực hoặc phiên đăng nhập không hợp lệ"));
    }

    public static Integer requireCurrentUserId() {
        return requireCurrentUser().id();
    }
}
