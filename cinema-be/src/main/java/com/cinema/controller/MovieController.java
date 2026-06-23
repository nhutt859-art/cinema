package com.cinema.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.dto.response.MovieResponse;
import com.cinema.service.MovieService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@Tag(name = "Movies", description = "Tra cứu danh sách phim và chi tiết phim")
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    @Operation(summary = "Danh sách phim", description = "Lấy danh sách phim theo trạng thái và phân trang.")
    public ResponseEntity<Page<MovieResponse>> getMovies(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(movieService.getMovies(status, pageable));
    }

    @GetMapping("/now-showing")
    @Operation(summary = "Phim đang chiếu", description = "Lấy danh sách phim đang chiếu.")
    public ResponseEntity<List<MovieResponse>> getNowShowing() {
        return ResponseEntity.ok(movieService.getNowShowing());
    }

    @GetMapping("/coming-soon")
    @Operation(summary = "Phim sắp chiếu", description = "Lấy danh sách phim sắp chiếu.")
    public ResponseEntity<List<MovieResponse>> getComingSoon() {
        return ResponseEntity.ok(movieService.getComingSoon());
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm phim", description = "Tìm kiếm phim theo từ khóa, không phân biệt hoa thường.")
    public ResponseEntity<Page<MovieResponse>> searchMovies(
            @RequestParam String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(movieService.searchMovies(keyword, pageable));
    }

    @GetMapping("/filter")
    @Operation(summary = "Lọc phim theo thể loại", description = "Lọc phim theo danh sách genre IDs.")
    public ResponseEntity<Page<MovieResponse>> filterByGenres(
            @RequestParam List<UUID> genreIds,
            Pageable pageable) {
        return ResponseEntity.ok(movieService.filterByGenres(genreIds, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết phim", description = "Lấy thông tin chi tiết của một phim.")
    public ResponseEntity<MovieResponse> getMovieDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(movieService.getMovieDetail(id));
    }
}
