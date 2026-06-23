package com.cinema.controller.admin;

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

import com.cinema.entity.Movie;
import com.cinema.enums.EntityStatus;
import com.cinema.exception.ResourceNotFoundException;
import com.cinema.repository.MovieRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
@Tag(name = "Admin Movies", description = "Quản lý phim, bao gồm thêm/sửa/xóa mềm")
public class AdminMovieController {

    private final MovieRepository movieRepository;

    @GetMapping
    @Operation(summary = "Danh sách phim admin", description = "Lấy toàn bộ phim theo phân trang.")
    public ResponseEntity<Page<Movie>> getAllMovies(Pageable pageable) {
        return ResponseEntity.ok(movieRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết phim admin", description = "Lấy phim theo ID.")
    public ResponseEntity<Movie> getMovie(@PathVariable UUID id) {
        return ResponseEntity.ok(movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found")));
    }

    @PostMapping
    @Operation(summary = "Tạo phim", description = "Tạo mới phim.")
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        return ResponseEntity.ok(movieRepository.save(movie));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật phim", description = "Cập nhật thông tin phim.")
    public ResponseEntity<Movie> updateMovie(@PathVariable UUID id, @RequestBody Movie movie) {
        Movie existing = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        movie.setMovieId(existing.getMovieId());
        return ResponseEntity.ok(movieRepository.save(movie));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm phim", description = "Đổi trạng thái phim sang INACTIVE thay vì xóa cứng.")
    public ResponseEntity<Void> softDeleteMovie(@PathVariable UUID id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        movie.setStatus(EntityStatus.INACTIVE);
        movieRepository.save(movie);
        return ResponseEntity.noContent().build();
    }
}
