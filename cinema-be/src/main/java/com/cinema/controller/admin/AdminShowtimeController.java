package com.cinema.controller.admin;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.entity.Showtime;
import com.cinema.enums.EntityStatus;
import com.cinema.exception.ResourceNotFoundException;
import com.cinema.repository.ShowtimeRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
@Tag(name = "Admin Showtimes", description = "Quản lý suất chiếu và chống trùng giờ")
public class AdminShowtimeController {

    private final ShowtimeRepository showtimeRepository;

    @GetMapping
    @Operation(summary = "Danh sách suất chiếu", description = "Lấy toàn bộ suất chiếu.")
    public ResponseEntity<?> getAllShowtimes() {
        return ResponseEntity.ok(showtimeRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Tạo suất chiếu", description = "Tạo suất chiếu mới và kiểm tra trùng giờ trong cùng phòng.")
    public ResponseEntity<?> createShowtime(@RequestBody Showtime showtime) {
        if (showtimeRepository.existsOverlappingShowtime(
                showtime.getRoom().getRoomId(),
                showtime.getStartTime(),
                showtime.getEndTime())) {
            return ResponseEntity.badRequest().body("Overlapping showtime in the same room");
        }
        return ResponseEntity.ok(showtimeRepository.save(showtime));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật suất chiếu", description = "Cập nhật thông tin suất chiếu.")
    public ResponseEntity<?> updateShowtime(@PathVariable UUID id, @RequestBody Showtime showtime) {
        Showtime existing = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        showtime.setShowtimeId(existing.getShowtimeId());
        return ResponseEntity.ok(showtimeRepository.save(showtime));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy suất chiếu", description = "Đánh dấu suất chiếu là CANCELLED.")
    public ResponseEntity<Void> cancelShowtime(@PathVariable UUID id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        showtime.setStatus(EntityStatus.CANCELLED);
        showtimeRepository.save(showtime);
        return ResponseEntity.noContent().build();
    }
}
