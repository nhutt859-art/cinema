package com.cinema.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.response.SeatResponse;
import com.cinema.service.SeatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@Tag(name = "Seats", description = "Xem sơ đồ ghế và khóa/nhả ghế realtime")
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/showtime/{showtimeId}")
    @Operation(summary = "Sơ đồ ghế của suất chiếu", description = "Lấy danh sách ghế theo suất chiếu.")
    public ResponseEntity<List<SeatResponse>> getSeatsByShowtime(@PathVariable UUID showtimeId) {
        return ResponseEntity.ok(seatService.getSeatsByShowtime(showtimeId));
    }

    @PostMapping("/lock")
    @Operation(summary = "Khóa ghế tạm thời", description = "Khóa danh sách ghế trong khi người dùng đang đặt vé.")
    public ResponseEntity<Void> lockSeats(@RequestBody Map<String, Object> request) {
        UUID showtimeId = UUID.fromString((String) request.get("showtimeId"));
        @SuppressWarnings("unchecked")
        List<String> seatIdStrings = (List<String>) request.get("seatIds");
        List<UUID> seatIds = seatIdStrings.stream().map(UUID::fromString).toList();
        String sessionId = (String) request.get("sessionId");

        seatService.lockSeats(showtimeId, seatIds, sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unlock")
    @Operation(summary = "Nhả ghế", description = "Nhả danh sách ghế đã khóa tạm thời.")
    public ResponseEntity<Void> unlockSeats(@RequestBody Map<String, Object> request) {
        UUID showtimeId = UUID.fromString((String) request.get("showtimeId"));
        @SuppressWarnings("unchecked")
        List<String> seatIdStrings = (List<String>) request.get("seatIds");
        List<UUID> seatIds = seatIdStrings.stream().map(UUID::fromString).toList();

        seatService.unlockSeats(showtimeId, seatIds);
        return ResponseEntity.ok().build();
    }
}
