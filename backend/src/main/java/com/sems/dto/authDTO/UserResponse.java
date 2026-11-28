package com.sems.dto.authDTO;

import java.time.LocalDateTime;
import java.util.List;

import com.sems.entity.User;

/** Thông tin tài khoản trả về client (không có password_hash và các trường nội bộ). */
public record UserResponse(
        Integer id,
        String email,
        String phone,
        String fullName,
        String gender,
        String avatarUrl,
        String status,
        boolean emailVerified,
        List<String> roles,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        String studentCode,
        String className,
        String facultyName
) {

    public static UserResponse from(User user, List<String> roles) {
        return from(user, roles, null, null, null);
    }

    /** Kèm hồ sơ sinh viên (studentCode, className, facultyName); tài khoản không phải sinh viên thì để null. */
    public static UserResponse from(User user, List<String> roles, String studentCode, String className, String facultyName) {
        return new UserResponse(user.getId(), user.getEmail(), user.getPhone(), user.getFullName(),
                user.getGender(), user.getAvatarUrl(), user.getStatus(), user.isEmailVerified(),
                roles, user.getLastLoginAt(), user.getCreatedAt(), studentCode, className, facultyName);
    }
}
