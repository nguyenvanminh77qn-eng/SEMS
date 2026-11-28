package com.sems.auth.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sems.auth.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** Thu hồi mọi phiên đang hoạt động của tài khoản (đổi/đặt lại mật khẩu). */
    @Modifying(flushAutomatically = true)
    @Query("update RefreshToken t set t.status = 'REVOKED', t.revokedAt = :now "
            + "where t.userId = :userId and t.status = 'ACTIVE'")
    int revokeAllActive(@Param("userId") Integer userId, @Param("now") LocalDateTime now);
}
