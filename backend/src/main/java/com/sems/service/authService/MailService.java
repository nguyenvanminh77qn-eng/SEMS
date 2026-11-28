package com.sems.service.authService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.sems.entity.OtpPurpose;
import com.sems.common.exception.BusinessException;
import com.sems.config.AppProperties;

/** Gửi email OTP. Khi app.mail.enabled=false (mặc định, dùng lúc dev) mã OTP được in ra console thay vì gửi mail. */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final AppProperties props;

    public MailService(ObjectProvider<JavaMailSender> mailSender, AppProperties props) {
        this.mailSender = mailSender;
        this.props = props;
    }

    public void sendOtp(String to, String code, OtpPurpose purpose, long ttlMinutes) {
        if (!props.mail().enabled()) {
            log.warn("[DEV] Gửi mail đang tắt. OTP {} của {} = {}", purpose, to, code);
            return;
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.error("Chưa cấu hình spring.mail.* nên không gửi được email");
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Không gửi được email. Vui lòng thử lại sau");
        }

        String subject;
        String intro;
        if (purpose == OtpPurpose.RESET_PASSWORD) {
            subject = "[SEMS] Mã OTP đặt lại mật khẩu";
            intro = "Bạn vừa yêu cầu đặt lại mật khẩu tài khoản SEMS.";
        } else {
            subject = "[SEMS] Mã OTP xác thực email";
            intro = "Cảm ơn bạn đã đăng ký tài khoản SEMS.";
        }
        String body = intro + "\n\nMã OTP của bạn: " + code
                + "\nMã có hiệu lực trong " + ttlMinutes + " phút. Không chia sẻ mã này với bất kỳ ai."
                + "\n\nNếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(props.mail().from());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        try {
            sender.send(message);
        } catch (MailException e) {
            log.error("Gửi email OTP thất bại tới {}", to, e);
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Không gửi được email. Vui lòng thử lại sau");
        }
    }
}
