package com.sems.controller.authController;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sems.dto.authDTO.AuthResponse;
import com.sems.dto.authDTO.ChangePasswordRequest;
import com.sems.dto.authDTO.ForgotPasswordRequest;
import com.sems.dto.authDTO.LoginRequest;
import com.sems.dto.authDTO.RefreshTokenRequest;
import com.sems.dto.authDTO.RegisterRequest;
import com.sems.dto.authDTO.UpdateProfileRequest;
import com.sems.dto.authDTO.ResendOtpRequest;
import com.sems.dto.authDTO.ResetPasswordRequest;
import com.sems.dto.authDTO.UserResponse;
import com.sems.dto.authDTO.VerifyEmailRequest;
import com.sems.service.authService.AuthService;
import com.sems.common.response.ApiResponse;
import com.sems.security.AuthenticatedUser;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/** /api/v1/auth/** : controller chỉ nhận request, gọi service và trả ApiResponse. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.created("Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực",
                authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return ApiResponse.ok("Đăng nhập thành công",
                authService.login(request.email(), request.password(), clientIp(http), userAgent(http)));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.ok("Đăng xuất thành công", null);
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest http) {
        return ApiResponse.ok("Làm mới token thành công",
                authService.refresh(request.refreshToken(), clientIp(http), userAgent(http)));
    }

    @PostMapping("/verify-email")
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ApiResponse.ok("Xác thực email thành công", null);
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ApiResponse.ok("Nếu email hợp lệ, mã OTP mới đã được gửi", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.ok("Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi", null);
    }

    /** Bước "xác nhận OTP" của quên mật khẩu: chỉ kiểm tra mã đúng hay sai, chưa đổi mật khẩu. */
    @PostMapping("/verify-reset-otp")
    public ApiResponse<Void> verifyResetOtp(@Valid @RequestBody VerifyEmailRequest request) {
        authService.checkResetOtp(request);
        return ApiResponse.ok("Mã OTP hợp lệ", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok("Đặt lại mật khẩu thành công", null);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser current) {
        return ApiResponse.ok(authService.getCurrentUser(current.id()));
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateProfile(@AuthenticationPrincipal AuthenticatedUser current,
                                                   @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Cập nhật thông tin thành công", authService.updateProfile(current.id(), request));
    }

    /** Trả về cặp token mới cho thiết bị đang đổi mật khẩu; các thiết bị khác phải đăng nhập lại. */
    @PatchMapping("/me/password")
    public ApiResponse<AuthResponse> changePassword(@AuthenticationPrincipal AuthenticatedUser current,
                                                    @Valid @RequestBody ChangePasswordRequest request,
                                                    HttpServletRequest http) {
        return ApiResponse.ok("Đổi mật khẩu thành công. Các thiết bị khác cần đăng nhập lại",
                authService.changePassword(current.id(), request, clientIp(http), userAgent(http)));
    }

    private static String clientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private static String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
}
