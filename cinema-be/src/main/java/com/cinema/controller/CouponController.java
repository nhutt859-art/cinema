package com.cinema.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.request.ApplyCouponRequest;
import com.cinema.dto.response.CouponResponse;
import com.cinema.service.CouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<CouponResponse> applyCoupon(@Valid @RequestBody ApplyCouponRequest request) {
        System.out.println(">>> applyCoupon: code=" + request.getCode() + ", amount=" + request.getOrderAmount());
        return ResponseEntity.ok(couponService.applyCoupon(request.getCode(), request.getOrderAmount()));
    }
}
