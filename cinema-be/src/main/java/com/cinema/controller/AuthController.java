package com.cinema.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.request.ForgotPasswordRequest;
import com.cinema.dto.request.LoginRequest;
import com.cinema.dto.request.RegisterRequest;
import com.cinema.dto.request.ResetPasswordRequest;
import com.cinema.dto.request.UpdateProfileRequest;
import com.cinema.dto.response.AuthResponse;
import com.cinema.dto.response.ProfileResponse;
import com.cinema.security.UserPrincipal;
import com.cinema.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Đăng ký, đăng nhập và quản lý hồ sơ người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Guest đăng ký bằng email, mật khẩu, họ tên và số điện thoại.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực email/mật khẩu và trả về JWT.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    @Operation(summary = "Xem hồ sơ", description = "Lấy thông tin hồ sơ của người dùng đang đăng nhập.")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getProfile(principal));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật hồ sơ", description = "Cập nhật ngày sinh, giới tính và số điện thoại.")
    public ResponseEntity<ProfileResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal, request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu", description = "Gửi mã xác nhận đặt lại mật khẩu qua email.")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "Ma xac nhan da gui den email cua ban"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu", description = "Xác nhận mã và đổi mật khẩu mới.")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Dat lai mat khau thanh cong"));
    }
}
