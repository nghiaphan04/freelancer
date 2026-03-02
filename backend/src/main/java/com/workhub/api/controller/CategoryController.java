package com.workhub.api.controller;

import com.workhub.api.dto.response.ApiResponse;
import com.workhub.api.dto.response.CategoryResponse;
import com.workhub.api.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/details")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategoriesWithDetails() {
        return ResponseEntity.ok(categoryService.getAllCategoriesWithDetails());
    }
}
