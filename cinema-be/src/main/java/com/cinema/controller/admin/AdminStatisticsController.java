package com.cinema.controller.admin;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.service.StatisticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@Tag(name = "Admin Statistics", description = "Thống kê doanh thu và dashboard")
public class AdminStatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard thống kê", description = "Lấy số liệu tổng quan cho dashboard admin.")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(statisticsService.getDashboardStats());
    }

    @GetMapping("/revenue")
    @Operation(summary = "Báo cáo doanh thu", description = "Lấy báo cáo doanh thu theo khoảng thời gian.")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getRevenueReport(startDate, endDate));
    }
}
