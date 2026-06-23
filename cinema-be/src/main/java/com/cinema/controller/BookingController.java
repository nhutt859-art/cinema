package com.cinema.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.request.BookingRequest;
import com.cinema.dto.response.BookingResponse;
import com.cinema.security.UserPrincipal;
import com.cinema.service.BookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Đặt vé, xem lịch sử và chi tiết hóa đơn")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Tạo booking", description = "Tạo đơn đặt vé từ ghế, combo và mã giảm giá.")
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(principal, request));
    }

    @GetMapping
    @Operation(summary = "Lịch sử đặt vé", description = "Lấy danh sách booking của người dùng hiện tại.")
    public ResponseEntity<Page<BookingResponse>> getUserBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable) {
        return ResponseEntity.ok(bookingService.getUserBookings(principal, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết booking", description = "Lấy chi tiết một booking theo ID.")
    public ResponseEntity<BookingResponse> getBookingDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getBookingDetail(id, principal));
    }
}
