package com.sems.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sems.auth.entity.EmailOtp;
import com.sems.auth.entity.OtpPurpose;
import com.sems.auth.entity.TokenStatus;
import com.sems.auth.entity.User;
import com.sems.auth.repository.EmailOtpRepository;
import com.sems.common.exception.BusinessException;
import com.sems.config.AppProperties;

/** Cấp và kiểm tra OTP: hiệu lực {app.otp.ttl-minutes}, tối đa {app.otp.max-attempts} lần nhập sai, chờ {app.otp.resend-seconds} giây mới gửi lại. */
@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailOtpRepository otpRepository;
    private final MailService mailService;
    private final AppProperties props;

    public OtpService(EmailOtpRepository otpRepository, MailService mailService, AppProperties props) {
        this.otpRepository = otpRepository;
        this.mailService = mailService;
        this.props = props;
    }

    @Transactional
    public void issue(User user, OtpPurpose purpose) {
        LocalDateTime now = LocalDateTime.now();
        long resendSeconds = props.otp().resendSeconds();

        otpRepository.findFirstByUserIdAndPurposeOrderByIdDesc(user.getId(), purpose).ifPresent(last -> {
            LocalDateTime nextAllowed = last.getCreatedAt().plusSeconds(resendSeconds);
            if (nextAllowed.isAfter(now)) {
                long wait = Math.max(1, Duration.between(now, nextAllowed).toSeconds());
                throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS,
                        "Vui lòng đợi " + wait + " giây trước khi yêu cầu mã mới");
            }
        });

        otpRepository.expireActive(user.getId(), purpose);

        EmailOtp otp = new EmailOtp();
        otp.setUserId(user.getId());
        otp.setEmail(user.getEmail());
        otp.setPurpose(purpose);
        otp.setOtpCode(String.format("%06d", RANDOM.nextInt(1_000_000)));
        otp.setExpiresAt(now.plusMinutes(props.otp().ttlMinutes()));
        otpRepository.save(otp);

        mailService.sendOtp(user.getEmail(), otp.getOtpCode(), purpose, props.otp().ttlMinutes());
    }

    /**
     * Kiểm tra OTP. Sai thì tăng attempt_count rồi ném lỗi; vì vậy phải noRollbackFor để số lần sai
     * vẫn được lưu (nếu rollback, kẻ tấn công thử OTP vô hạn).
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public void verify(User user, OtpPurpose purpose, String code) {
        doVerify(user, purpose, code, true);
    }

    /** Chỉ kiểm tra OTP đúng hay sai (vẫn tính số lần sai) và KHÔNG tiêu thụ mã; dùng cho bước "xác nhận OTP" khi quên mật khẩu. */
    @Transactional(noRollbackFor = BusinessException.class)
    public void check(User user, OtpPurpose purpose, String code) {
        doVerify(user, purpose, code, false);
    }

    private void doVerify(User user, OtpPurpose purpose, String code, boolean consume) {
        EmailOtp otp = otpRepository
                .findFirstByUserIdAndPurposeAndStatusOrderByIdDesc(user.getId(), purpose, TokenStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                        "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại mã mới"));

        LocalDateTime now = LocalDateTime.now();
        if (otp.getExpiresAt().isBefore(now)) {
            otp.setStatus(TokenStatus.EXPIRED);
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới");
        }

        int max = props.otp().maxAttempts();
        if (otp.getAttemptCount() >= max) {
            otp.setStatus(TokenStatus.EXPIRED);
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới");
        }

        boolean match = MessageDigest.isEqual(
                otp.getOtpCode().getBytes(StandardCharsets.UTF_8), code.getBytes(StandardCharsets.UTF_8));
        if (!match) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            int left = max - otp.getAttemptCount();
            if (left <= 0) {
                otp.setStatus(TokenStatus.EXPIRED);
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới");
            }
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng. Còn " + left + " lần thử");
        }

        if (consume) {
            otp.setStatus(TokenStatus.USED);
            otp.setUsedAt(now);
        }
    }
}
