package com.sems.repository.authRepository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sems.entity.EmailOtp;
import com.sems.entity.OtpPurpose;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Integer> {

    Optional<EmailOtp> findFirstByUserIdAndPurposeOrderByIdDesc(Integer userId, OtpPurpose purpose);

    Optional<EmailOtp> findFirstByUserIdAndPurposeAndStatusOrderByIdDesc(Integer userId, OtpPurpose purpose, String status);

    /** Mã mới được cấp thì các mã ACTIVE cũ cùng mục đích không còn dùng được. */
    @Modifying(flushAutomatically = true)
    @Query("update EmailOtp o set o.status = 'EXPIRED' "
            + "where o.userId = :userId and o.purpose = :purpose and o.status = 'ACTIVE'")
    int expireActive(@Param("userId") Integer userId, @Param("purpose") OtpPurpose purpose);
}
