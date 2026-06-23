package com.cinema.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.entity.Combo;
import com.cinema.enums.EntityStatus;
import com.cinema.repository.ComboRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/combos")
@RequiredArgsConstructor
@Tag(name = "Combos", description = "Danh sách combo bắp nước")
public class ComboController {

    private final ComboRepository comboRepository;

    @GetMapping
    @Operation(summary = "Danh sách combo", description = "Lấy danh sách combo còn hoạt động.")
    public ResponseEntity<List<Combo>> getActiveCombos() {
        return ResponseEntity.ok(comboRepository.findByStatus(EntityStatus.ACTIVE));
    }
}
