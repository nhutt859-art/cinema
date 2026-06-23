package com.cinema.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.response.BookingResponse;
import com.cinema.security.UserPrincipal;
import com.cinema.service.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Khởi tạo và kiểm tra trạng thái thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/bank/initiate/{bookingId}")
    @Operation(summary = "Khởi tạo thanh toán", description = "Tạo giao dịch thanh toán cho booking.")
    public ResponseEntity<BookingResponse> initiateBankPayment(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingResponse response = paymentService.initiateBankPayment(bookingId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/status")
    @Operation(summary = "Trạng thái thanh toán", description = "Kiểm tra trạng thái thanh toán của booking.")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(bookingId, principal));
    }
}
