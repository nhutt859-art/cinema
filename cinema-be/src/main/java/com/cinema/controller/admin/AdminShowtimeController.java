package com.cinema.controller.admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.response.ShowtimeResponse;
import com.cinema.entity.Room;
import com.cinema.entity.Showtime;
import com.cinema.enums.EntityStatus;
import com.cinema.exception.ResourceNotFoundException;
import com.cinema.repository.RoomRepository;
import com.cinema.repository.ShowtimeRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
public class AdminShowtimeController {

    private final ShowtimeRepository showtimeRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<?> getAllShowtimes(Pageable pageable) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        Page<ShowtimeResponse> response = showtimeRepository.findByStartTimeGreaterThanEqualAndStatusNot(today, EntityStatus.CANCELLED, pageable)
            .map(this::toResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createShowtime(@RequestBody Showtime showtime) {
        Room room = roomRepository.findById(showtime.getRoom().getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (room.getStatus() != EntityStatus.ACTIVE) {
            return ResponseEntity.badRequest().body("Room is not active");
        }

        if (showtime.getStartTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Cannot create showtime in the past");
        }
        if (showtimeRepository.existsOverlappingShowtime(
                showtime.getRoom().getRoomId(),
                showtime.getStartTime(),
                showtime.getEndTime())) {
            return ResponseEntity.badRequest().body("Overlapping showtime in the same room");
        }
        Showtime saved = showtimeRepository.save(showtime);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShowtime(@PathVariable UUID id, @RequestBody Showtime showtime) {
        Showtime existing = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        showtime.setShowtimeId(existing.getShowtimeId());
        Showtime saved = showtimeRepository.save(showtime);
        return ResponseEntity.ok(toResponse(saved));
    }

    private ShowtimeResponse toResponse(Showtime s) {
        return ShowtimeResponse.builder()
                .showtimeId(s.getShowtimeId())
                .movieId(s.getMovie().getMovieId())
                .movieTitle(s.getMovie().getTitle())
                .roomId(s.getRoom().getRoomId())
                .roomName(s.getRoom().getRoomName())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .basePrice(s.getBasePrice())
                .status(s.getStatus().name())
                .build();
    }

    @PostMapping("/batch-cancel")
    public ResponseEntity<Void> batchCancelShowtimes(@RequestBody List<UUID> ids) {
        List<Showtime> showtimes = showtimeRepository.findAllById(ids);
        showtimes.forEach(st -> st.setStatus(EntityStatus.CANCELLED));
        showtimeRepository.saveAll(showtimes);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelShowtime(@PathVariable UUID id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found"));
        showtime.setStatus(EntityStatus.CANCELLED);
        showtimeRepository.save(showtime);
        return ResponseEntity.noContent().build();
    }
}
