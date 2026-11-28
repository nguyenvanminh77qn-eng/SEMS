package com.sems.auth.entity;

/** Mục đích OTP, lưu ở cột email_otps.purpose (VARCHAR(20)). */
public enum OtpPurpose {
    VERIFY_EMAIL,
    RESET_PASSWORD
}
