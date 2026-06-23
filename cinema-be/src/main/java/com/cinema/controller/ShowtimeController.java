package com.cinema.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.response.ShowtimeResponse;
import com.cinema.service.ShowtimeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@Tag(name = "Showtimes", description = "Tra cứu suất chiếu theo phim")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/movie/{movieId}")
    @Operation(summary = "Suất chiếu theo phim", description = "Lấy danh sách suất chiếu của một phim.")
    public ResponseEntity<List<ShowtimeResponse>> getShowtimesByMovie(@PathVariable UUID movieId) {
        return ResponseEntity.ok(showtimeService.getShowtimesByMovie(movieId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết suất chiếu", description = "Lấy thông tin chi tiết của một suất chiếu.")
    public ResponseEntity<ShowtimeResponse> getShowtimeDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(showtimeService.getShowtimeDetail(id));
    }
}
