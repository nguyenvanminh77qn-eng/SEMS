-- ============================================================
-- SEMS - Student Event Management System
-- Database: MySQL 8.0.16+
-- Charset: utf8mb4
--
-- Luu y:
-- 1. Script tao moi database `sems_db` neu chua ton tai.
-- 2. Neu database da ton tai, script KHONG xoa du lieu cu.
-- 3. Cac cot/quan he duoc tong hop tu thiet ke cua nhom va cac
--    diem da thong nhat: moi event co 1 Organizer; notifications
--    luu theo tung nguoi nhan; attendance_records la nguon diem danh.
-- 4. Chay toan bo file trong MySQL Workbench hoac mysql CLI.
-- ============================================================

CREATE DATABASE IF NOT EXISTS sems_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sems_db;

-- ------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15) NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NULL,
    gender VARCHAR(10) NULL,
    avatar_url VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_count INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_phone UNIQUE (phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    -- Tai khoan thuc hien viec gan role; co the NULL khi seed he thong.
    assigner_id INT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_assigner
        FOREIGN KEY (assigner_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    ip_address VARCHAR(45) NULL,
    device_info VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_refresh_tokens_user_status (user_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    attempt_count INT NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_otps_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_email_otps_user_purpose (user_id, purpose),
    INDEX idx_email_otps_expiry (expires_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. STUDENT PROFILE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_code VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NULL,
    faculty_name VARCHAR(150) NULL,
    course_year VARCHAR(10) NULL,
    date_of_birth DATE NULL,
    phone VARCHAR(15) NULL,
    email VARCHAR(150) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_students_user UNIQUE (user_id),
    CONSTRAINT uq_students_code UNIQUE (student_code),
    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. EVENTS & ORGANIZER
-- One event has one Organizer account.
-- created_by = account that creates the event (e.g. Admin).
-- organizer_id = account assigned to be responsible for event.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cover_text VARCHAR(100) NULL,
    description TEXT NULL,
    location VARCHAR(255) NULL,
    organizer_unit VARCHAR(150) NULL,
    organizer_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_participants INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_events_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_events_time CHECK (end_time > start_time),
    CONSTRAINT chk_events_max_participants CHECK (max_participants IS NULL OR max_participants > 0),
    INDEX idx_events_status_start (status, start_time),
    INDEX idx_events_organizer (organizer_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. EVENT REGISTRATION
-- Attendance timestamp is stored only in attendance_records.
-- Cancelled registrations remain as history; a student may register
-- again for the same event after cancellation.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_code VARCHAR(30) NOT NULL,
    student_id INT NOT NULL,
    event_id INT NOT NULL,
    phone VARCHAR(15) NULL,
    email VARCHAR(150) NULL,
    commitment_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME NULL,
    active_student_id INT GENERATED ALWAYS AS (
        CASE WHEN cancelled_at IS NULL THEN student_id ELSE NULL END
    ) STORED,
    cancel_reason VARCHAR(255) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_registrations_code UNIQUE (registration_code),
    CONSTRAINT uq_event_registrations_active_student_event UNIQUE (event_id, active_student_id),
    CONSTRAINT fk_event_registrations_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_event_registrations_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_event_registrations_event_status (event_id, status),
    INDEX idx_event_registrations_student_date (student_id, registered_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. EVENT REVIEWS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    good_points JSON NULL,
    comment TEXT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_reviews_registration UNIQUE (registration_id),
    CONSTRAINT fk_event_reviews_registration
        FOREIGN KEY (registration_id) REFERENCES event_registrations(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_event_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. QR TOKENS & ATTENDANCE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS attendance_qr_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    token VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_qr_tokens_token UNIQUE (token),
    CONSTRAINT fk_attendance_qr_tokens_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_qr_tokens_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_attendance_qr_event_status (event_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    method VARCHAR(20) NOT NULL DEFAULT 'QR',
    qr_token_id INT NULL,
    evidence_url VARCHAR(255) NULL,
    checked_in_at DATETIME NULL,
    marked_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_records_registration UNIQUE (registration_id),
    CONSTRAINT fk_attendance_records_registration
        FOREIGN KEY (registration_id) REFERENCES event_registrations(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_records_qr_token
        FOREIGN KEY (qr_token_id) REFERENCES attendance_qr_tokens(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_attendance_records_marker
        FOREIGN KEY (marked_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_attendance_records_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. EVENT ATTENDANCE REPORT (OPTIONAL SNAPSHOT)
-- Can be removed if all reports are calculated from attendance_records.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_attendance_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    submitted_by INT NOT NULL,
    total_count INT NOT NULL DEFAULT 0,
    present_count INT NOT NULL DEFAULT 0,
    late_count INT NOT NULL DEFAULT 0,
    absent_count INT NOT NULL DEFAULT 0,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_attendance_reports_event UNIQUE (event_id),
    CONSTRAINT fk_event_attendance_reports_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_event_attendance_reports_submitter
        FOREIGN KEY (submitted_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_event_attendance_report_counts CHECK (
        total_count >= 0 AND present_count >= 0
        AND late_count >= 0 AND absent_count >= 0
    )
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. NOTIFICATIONS
-- One row per recipient so each user has independent read status.
-- event_id is NULL for general notifications not tied to an event.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NULL,
    created_by INT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    content VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_creator
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notifications_user_created (user_id, created_at),
    INDEX idx_notifications_user_unread (user_id, is_read),
    INDEX idx_notifications_event (event_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. INITIAL ROLES
-- Remove this section if the team wants to seed roles separately.
-- ------------------------------------------------------------

INSERT IGNORE INTO roles (name) VALUES
('ADMIN'),
('STUDENT'),
('ORGANIZER');

-- ============================================================
-- END
-- ============================================================
