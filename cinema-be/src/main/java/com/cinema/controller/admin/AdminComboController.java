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

import com.cinema.entity.Combo;
import com.cinema.enums.EntityStatus;
import com.cinema.exception.ResourceNotFoundException;
import com.cinema.repository.ComboRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/combos")
@RequiredArgsConstructor
@Tag(name = "Admin Combos", description = "Quản lý combo bắp nước")
public class AdminComboController {

    private final ComboRepository comboRepository;

    @GetMapping
    @Operation(summary = "Danh sách combo admin", description = "Lấy toàn bộ combo theo phân trang.")
    public ResponseEntity<Page<Combo>> getAllCombos(Pageable pageable) {
        return ResponseEntity.ok(comboRepository.findAll(pageable));
    }

    @PostMapping
    @Operation(summary = "Tạo combo", description = "Tạo mới combo.")
    public ResponseEntity<Combo> createCombo(@RequestBody Combo combo) {
        return ResponseEntity.ok(comboRepository.save(combo));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật combo", description = "Cập nhật thông tin combo.")
    public ResponseEntity<Combo> updateCombo(@PathVariable UUID id, @RequestBody Combo combo) {
        combo.setComboId(id);
        return ResponseEntity.ok(comboRepository.save(combo));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm combo", description = "Đổi trạng thái combo sang INACTIVE thay vì xóa cứng.")
    public ResponseEntity<Void> softDeleteCombo(@PathVariable UUID id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found"));
        combo.setStatus(EntityStatus.INACTIVE);
        comboRepository.save(combo);
        return ResponseEntity.noContent().build();
    }
}
