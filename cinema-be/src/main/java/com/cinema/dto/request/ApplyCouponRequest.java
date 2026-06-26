package com.cinema.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyCouponRequest {

    @NotBlank
    private String code;

    @NotNull(message = "Order amount is required")
    private BigDecimal orderAmount;
}
