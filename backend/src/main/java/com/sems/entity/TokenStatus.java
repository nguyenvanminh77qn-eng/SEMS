package com.sems.entity;

/** Giá trị cột status của refresh_tokens và email_otps. */
public final class TokenStatus {

    public static final String ACTIVE = "ACTIVE";
    public static final String USED = "USED";
    public static final String REVOKED = "REVOKED";
    public static final String EXPIRED = "EXPIRED";

    private TokenStatus() {
    }
}
