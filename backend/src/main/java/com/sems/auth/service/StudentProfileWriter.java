package com.sems.auth.service;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tạo dòng hồ sơ trong bảng students khi sinh viên đăng ký tài khoản.
 *
 * Bảng students thuộc module của Hòa (Student & Participation). Đăng ký tài khoản cần tạo hồ sơ ngay
 * nên module auth ghi tạm bằng SQL thuần để không phụ thuộc vào entity của module khác.
 * Khi module student có StudentService, thay lớp này bằng lời gọi sang service đó.
 */
@Component
public class StudentProfileWriter {

    private final JdbcTemplate jdbc;

    public StudentProfileWriter(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean existsByStudentCode(String studentCode) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM students WHERE student_code = ?", Integer.class, studentCode);
        return count != null && count > 0;
    }

    /** Hồ sơ sinh viên của tài khoản: {student_code, class_name, faculty_name}; null nếu không phải sinh viên. */
    public Map<String, Object> findByUserId(Integer userId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT student_code, class_name, faculty_name FROM students WHERE user_id = ?", userId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    /** Cập nhật hồ sơ; tài khoản không có dòng trong students thì không có gì bị đổi. */
    public void updateProfile(Integer userId, String fullName, String className, String facultyName, String phone) {
        jdbc.update("UPDATE students SET full_name = ?, class_name = ?, faculty_name = ?, phone = ? WHERE user_id = ?",
                fullName, className, facultyName, phone, userId);
    }

    public void insert(Integer userId, String studentCode, String fullName, String className,
                       String facultyName, String phone, String email) {
        jdbc.update("INSERT INTO students (user_id, student_code, full_name, class_name, faculty_name, phone, email) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                userId, studentCode, fullName, className, facultyName, phone, email);
    }
}
