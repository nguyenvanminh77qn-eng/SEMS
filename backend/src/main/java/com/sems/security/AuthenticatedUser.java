package com.sems.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * Thông tin tài khoản hiện tại, lấy từ JWT (không tin dữ liệu client tự gửi).
 * Controller lấy bằng @AuthenticationPrincipal AuthenticatedUser hoặc SecurityUtils.
 */
public record AuthenticatedUser(Integer id, String email, List<String> roles) {

    public Collection<? extends GrantedAuthority> authorities() {
        return roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
    }

    public boolean hasRole(String role) {
        return roles.contains(role);
    }
}
