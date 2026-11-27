package com.sems.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cập nhật hồ sơ của chính mình (PATCH /api/v1/auth/me). Email và mã sinh viên không đổi qua API này.
 * className và facultyName chỉ có tác dụng với tài khoản sinh viên.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "Họ và tên không được để trống")
        @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
        String fullName,

        @Pattern(regexp = "^(0\\d{9})?$", message = "Số điện thoại gồm 10 số, bắt đầu bằng 0")
        String phone,

        @Pattern(regexp = "^(Nam|Nữ|Khác)?$", message = "Giới tính chỉ nhận Nam, Nữ hoặc Khác")
        String gender,

        @Size(max = 50, message = "Lớp tối đa 50 ký tự")
        String className,

        @Size(max = 150, message = "Khoa tối đa 150 ký tự")
        String facultyName
) {
}
