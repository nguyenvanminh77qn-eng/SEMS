package com.sems.auth.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sems.auth.dto.AuthResponse;
import com.sems.auth.dto.ChangePasswordRequest;
import com.sems.auth.dto.ForgotPasswordRequest;
import com.sems.auth.dto.RegisterRequest;
import com.sems.auth.dto.UpdateProfileRequest;
import com.sems.auth.dto.ResendOtpRequest;
import com.sems.auth.dto.ResetPasswordRequest;
import com.sems.auth.dto.UserResponse;
import com.sems.auth.dto.VerifyEmailRequest;
import com.sems.auth.entity.OtpPurpose;
import com.sems.auth.entity.RefreshToken;
import com.sems.auth.entity.Role;
import com.sems.auth.entity.RoleName;
import com.sems.auth.entity.TokenStatus;
import com.sems.auth.entity.User;
import com.sems.auth.entity.UserRole;
import com.sems.auth.entity.UserStatus;
import com.sems.auth.repository.RefreshTokenRepository;
import com.sems.auth.repository.RoleRepository;
import com.sems.auth.repository.UserRepository;
import com.sems.auth.repository.UserRoleRepository;
import com.sems.common.exception.BusinessException;
import com.sems.common.exception.DuplicateResourceException;
import com.sems.config.AppProperties;
import com.sems.security.JwtService;

/**
 * Nghiệp vụ tài khoản: đăng ký, đăng nhập, token, OTP, quên/đổi mật khẩu.
 *
 * Lưu ý noRollbackFor = BusinessException: các hàm bên dưới vừa ghi (tăng số lần đăng nhập sai,
 * số lần nhập sai OTP...) vừa ném lỗi nghiệp vụ. Nếu để mặc định thì giao dịch bị rollback
 * và các bộ đếm chống dò mật khẩu/OTP không bao giờ được lưu.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final StudentProfileWriter studentProfileWriter;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties props;

    // Băm giả để thời gian phản hồi khi email không tồn tại gần bằng khi email tồn tại (chống dò email qua độ trễ).
    private final String dummyHash;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       UserRoleRepository userRoleRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       OtpService otpService,
                       StudentProfileWriter studentProfileWriter,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       AppProperties props) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpService = otpService;
        this.studentProfileWriter = studentProfileWriter;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.props = props;
        this.dummyHash = passwordEncoder.encode("sems-dummy-password");
    }

    // ------------------------------------------------------------------ Đăng ký / xác thực email

    @Transactional
    public UserResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());
        String phone = blankToNull(req.phone());
        String studentCode = req.studentCode().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException(
                    "Email này đã được đăng ký. Nếu chưa xác thực, hãy gửi lại OTP hoặc dùng chức năng quên mật khẩu");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại này đã được sử dụng");
        }
        if (studentProfileWriter.existsByStudentCode(studentCode)) {
            throw new DuplicateResourceException("Mã sinh viên này đã có tài khoản");
        }

        Role studentRole = roleRepository.findByName(RoleName.STUDENT).orElseThrow(() ->
                new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa khởi tạo vai trò STUDENT trong database"));

        User user = new User();
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFullName(req.fullName().trim());
        user.setGender(blankToNull(req.gender()));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(false);
        userRepository.save(user);

        userRoleRepository.save(new UserRole(user, studentRole, null));
        studentProfileWriter.insert(user.getId(), studentCode, user.getFullName(),
                blankToNull(req.className()), blankToNull(req.facultyName()), phone, email);

        otpService.issue(user, OtpPurpose.VERIFY_EMAIL);
        return toResponse(user, List.of(RoleName.STUDENT));
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public void verifyEmail(VerifyEmailRequest req) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .orElseThrow(AuthService::invalidOtp);
        if (user.isEmailVerified()) {
            return;
        }
        otpService.verify(user, OtpPurpose.VERIFY_EMAIL, req.otp());
        user.setEmailVerified(true);
    }

    /** Luôn trả thành công dù email có tồn tại hay không, để không lộ email nào đã đăng ký. */
    @Transactional
    public void resendOtp(ResendOtpRequest req) {
        OtpPurpose purpose = req.purpose() == null ? OtpPurpose.VERIFY_EMAIL : req.purpose();
        userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .filter(u -> UserStatus.ACTIVE.equals(u.getStatus()))
                .filter(u -> purpose == OtpPurpose.RESET_PASSWORD || !u.isEmailVerified())
                .ifPresent(u -> otpService.issue(u, purpose));
    }

    // ------------------------------------------------------------------ Đăng nhập / token

    @Transactional(noRollbackFor = BusinessException.class)
    public AuthResponse login(String rawEmail, String password, String ip, String device) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(rawEmail)).orElse(null);
        if (user == null) {
            passwordEncoder.matches(password, dummyHash);
            throw invalidCredentials(null);
        }

        LocalDateTime now = LocalDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw lockedException(Duration.between(now, user.getLockedUntil()).toSeconds());
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            int fails = user.getFailedLoginCount() + 1;
            int max = props.login().maxFailures();
            if (fails >= max) {
                user.setFailedLoginCount(0);
                user.setLockedUntil(now.plusMinutes(props.login().lockMinutes()));
                throw lockedException(props.login().lockMinutes() * 60);
            }
            user.setFailedLoginCount(fails);
            throw invalidCredentials(max - fails);
        }

        // Kiểm tra trạng thái sau khi mật khẩu đúng để người lạ không dò được tình trạng tài khoản.
        if (!UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new BusinessException(HttpStatus.FORBIDDEN,
                    "Tài khoản đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị viên");
        }
        if (!user.isEmailVerified()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Email chưa được xác thực",
                    Map.of("errorCode", "EMAIL_NOT_VERIFIED"));
        }

        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(now);
        return issueTokens(user, ip, device);
    }

    /** Xoay vòng refresh token: token cũ bị thu hồi ngay khi đổi lấy cặp token mới. */
    @Transactional(noRollbackFor = BusinessException.class)
    public AuthResponse refresh(String rawRefreshToken, String ip, String device) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(TokenHasher.sha256Hex(rawRefreshToken))
                .orElseThrow(AuthService::invalidRefreshToken);
        LocalDateTime now = LocalDateTime.now();

        if (!TokenStatus.ACTIVE.equals(token.getStatus())) {
            throw invalidRefreshToken();
        }
        if (token.getExpiresAt().isBefore(now)) {
            token.setStatus(TokenStatus.EXPIRED);
            throw invalidRefreshToken();
        }
        User user = userRepository.findById(token.getUserId()).orElseThrow(AuthService::invalidRefreshToken);
        if (!UserStatus.ACTIVE.equals(user.getStatus())) {
            token.setStatus(TokenStatus.REVOKED);
            token.setRevokedAt(now);
            throw new BusinessException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa hoặc vô hiệu hóa");
        }

        token.setStatus(TokenStatus.REVOKED);
        token.setRevokedAt(now);
        return issueTokens(user, ip, device);
    }

    /** Đăng xuất: thu hồi refresh token. Idempotent, token không tồn tại cũng coi như thành công. */
    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(TokenHasher.sha256Hex(rawRefreshToken))
                .filter(t -> TokenStatus.ACTIVE.equals(t.getStatus()))
                .ifPresent(t -> {
                    t.setStatus(TokenStatus.REVOKED);
                    t.setRevokedAt(LocalDateTime.now());
                });
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new BusinessException(HttpStatus.UNAUTHORIZED, "Tài khoản không còn tồn tại"));
        return toResponse(user, userRoleRepository.findRoleNamesByUserId(userId));
    }

    /** Cập nhật hồ sơ của chính mình. Email và mã sinh viên không đổi qua đây. */
    @Transactional
    public UserResponse updateProfile(Integer userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new BusinessException(HttpStatus.UNAUTHORIZED, "Tài khoản không còn tồn tại"));
        String phone = blankToNull(req.phone());
        if (phone != null && !phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
            throw new DuplicateResourceException("Số điện thoại này đã được sử dụng");
        }
        user.setFullName(req.fullName().trim());
        user.setPhone(phone);
        user.setGender(blankToNull(req.gender()));
        studentProfileWriter.updateProfile(userId, user.getFullName(),
                blankToNull(req.className()), blankToNull(req.facultyName()), phone);
        return toResponse(user, userRoleRepository.findRoleNamesByUserId(userId));
    }

    // ------------------------------------------------------------------ Quên / đặt lại / đổi mật khẩu

    /** Luôn trả thành công dù email có tồn tại hay không. */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .filter(u -> UserStatus.ACTIVE.equals(u.getStatus()))
                .ifPresent(u -> otpService.issue(u, OtpPurpose.RESET_PASSWORD));
    }

    /** Bước "xác nhận OTP" trước khi nhập mật khẩu mới: chỉ kiểm tra mã, chưa tiêu thụ. */
    @Transactional(noRollbackFor = BusinessException.class)
    public void checkResetOtp(VerifyEmailRequest req) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .orElseThrow(AuthService::invalidOtp);
        otpService.check(user, OtpPurpose.RESET_PASSWORD, req.otp());
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .orElseThrow(AuthService::invalidOtp);
        otpService.verify(user, OtpPurpose.RESET_PASSWORD, req.otp());

        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        user.setEmailVerified(true);   // đã chứng minh sở hữu email bằng OTP
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        refreshTokenRepository.revokeAllActive(user.getId(), LocalDateTime.now());
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public AuthResponse changePassword(Integer userId, ChangePasswordRequest req, String ip, String device) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new BusinessException(HttpStatus.UNAUTHORIZED, "Tài khoản không còn tồn tại"));
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Validation failed",
                    Map.of("currentPassword", "Mật khẩu hiện tại không đúng"));
        }
        if (passwordEncoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Validation failed",
                    Map.of("newPassword", "Mật khẩu mới phải khác mật khẩu hiện tại"));
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        // Thu hồi mọi phiên cũ (mọi thiết bị) rồi cấp cặp token mới cho thiết bị đang đổi mật khẩu,
        // để người dùng không bị đăng xuất ngay sau khi đổi.
        refreshTokenRepository.revokeAllActive(userId, LocalDateTime.now());
        return issueTokens(user, ip, device);
    }

    // ------------------------------------------------------------------ nội bộ

    private AuthResponse issueTokens(User user, String ip, String device) {
        List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), roles);

        String rawRefresh = TokenHasher.generateToken();
        RefreshToken refresh = new RefreshToken();
        refresh.setUserId(user.getId());
        refresh.setTokenHash(TokenHasher.sha256Hex(rawRefresh));
        refresh.setExpiresAt(LocalDateTime.now().plusDays(props.jwt().refreshTokenDays()));
        refresh.setIpAddress(truncate(ip, 45));
        refresh.setDeviceInfo(truncate(device, 255));
        refreshTokenRepository.save(refresh);

        return new AuthResponse(accessToken, rawRefresh, "Bearer", jwtService.accessTokenTtlSeconds(),
                toResponse(user, roles));
    }

    /** Gộp thông tin tài khoản với hồ sơ sinh viên (nếu có). */
    private UserResponse toResponse(User user, List<String> roles) {
        Map<String, Object> st = studentProfileWriter.findByUserId(user.getId());
        if (st == null) {
            return UserResponse.from(user, roles);
        }
        return UserResponse.from(user, roles,
                (String) st.get("student_code"), (String) st.get("class_name"), (String) st.get("faculty_name"));
    }

    private static BusinessException invalidCredentials(Integer attemptsLeft) {
        String hint = (attemptsLeft != null && attemptsLeft <= 2) ? ". Còn " + attemptsLeft + " lần thử" : "";
        return new BusinessException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng" + hint);
    }

    private static BusinessException lockedException(long seconds) {
        long minutes = Math.max(1, (seconds + 59) / 60);
        return new BusinessException(HttpStatus.TOO_MANY_REQUESTS,
                "Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau " + minutes + " phút");
    }

    private static BusinessException invalidOtp() {
        return new BusinessException(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    private static BusinessException invalidRefreshToken() {
        return new BusinessException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ hoặc đã hết hạn");
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private static String truncate(String value, int max) {
        return (value == null || value.length() <= max) ? value : value.substring(0, max);
    }
}
