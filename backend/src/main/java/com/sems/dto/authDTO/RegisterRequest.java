package com.sems.dto.authDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Đăng ký công khai luôn tạo tài khoản vai trò STUDENT. Quy tắc validation khớp với form đăng ký ở frontend. */
public record RegisterRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email chưa đúng định dạng")
        @Size(max = 150, message = "Email tối đa 150 ký tự")
        String email,

        // BCrypt chỉ xét 72 byte đầu nên giới hạn 72 ký tự.
        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 72, message = "Mật khẩu cần từ 8 đến 72 ký tự")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Mật khẩu cần gồm cả chữ và số")
        String password,

        @NotBlank(message = "Họ và tên không được để trống")
        @Size(max = 100, message = "Họ và tên tối đa 100 ký tự")
        String fullName,

        // students.student_code là NOT NULL trong database nên đăng ký sinh viên phải có mã.
        @NotBlank(message = "Mã sinh viên không được để trống")
        @Size(max = 20, message = "Mã sinh viên tối đa 20 ký tự")
        @Pattern(regexp = "^\\d+$", message = "Mã sinh viên chỉ gồm chữ số")
        String studentCode,

        @Size(max = 50, message = "Lớp tối đa 50 ký tự")
        String className,

        @Size(max = 150, message = "Khoa tối đa 150 ký tự")
        String facultyName,

        @Pattern(regexp = "^(0\\d{9})?$", message = "Số điện thoại gồm 10 số, bắt đầu bằng 0")
        String phone,

        @Pattern(regexp = "^(Nam|Nữ|Khác)?$", message = "Giới tính chỉ nhận Nam, Nữ hoặc Khác")
        String gender
) {
}
