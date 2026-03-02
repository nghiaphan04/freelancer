package com.workhub.api.service;

import com.workhub.api.dto.response.*;
import com.workhub.api.entity.Category;
import com.workhub.api.entity.EJobStatus;
import com.workhub.api.entity.SubCategory;
import com.workhub.api.entity.SubCategoryTag;
import com.workhub.api.repository.CategoryRepository;
import com.workhub.api.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

        private final CategoryRepository categoryRepository;
        private final JobRepository jobRepository;

        @Transactional(readOnly = true)
        public ApiResponse<List<CategoryResponse>> getAllCategories() {
                List<Category> categories = categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();
                List<CategoryResponse> response = categories.stream()
                                .map(this::mapToCategoryResponse)
                                .collect(Collectors.toList());
                return ApiResponse.success("Lấy danh sách danh mục thành công", response);
        }

        @Transactional(readOnly = true)
        public ApiResponse<List<CategoryResponse>> getAllCategoriesWithDetails() {
                List<Category> categories = categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();

                // Trigger lazy loading of subCategories and tags within transaction
                categories.forEach(c -> {
                        c.getSubCategories().size(); // Trigger load
                        c.getSubCategories().forEach(sc -> sc.getTags().size()); // Trigger load
                });

                List<CategoryResponse> response = categories.stream()
                                .map(this::mapToCategoryResponseWithDetails)
                                .collect(Collectors.toList());
                return ApiResponse.success("Lấy danh sách danh mục chi tiết thành công", response);
        }

        @Transactional(readOnly = true)
        public ApiResponse<List<CategoryResponse>> getAllCategoriesWithJobCounts() {
                List<Category> categories = categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();

                // Get job counts for all categories in one query
                List<EJobStatus> activeStatuses = Arrays.asList(EJobStatus.OPEN, EJobStatus.IN_PROGRESS);
                Map<Long, Long> jobCountMap = jobRepository.countJobsByCategory(activeStatuses).stream()
                                .collect(Collectors.toMap(
                                                JobRepository.CategoryJobCount::getCategoryId,
                                                JobRepository.CategoryJobCount::getCount));

                List<CategoryResponse> response = categories.stream()
                                .map(c -> mapToCategoryResponseWithJobCount(c, jobCountMap.getOrDefault(c.getId(), 0L)))
                                .collect(Collectors.toList());

                return ApiResponse.success("Lấy danh sách danh mục với số lượng việc làm thành công", response);
        }

        @Transactional(readOnly = true)
        public ApiResponse<List<CategoryResponse>> getAllCategoriesWithDetailsAndJobCounts() {
                List<Category> categories = categoryRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();

              
                categories.forEach(c -> {
                        c.getSubCategories().size(); // Trigger load
                        c.getSubCategories().forEach(sc -> sc.getTags().size()); 
                });

                List<EJobStatus> activeStatuses = Arrays.asList(EJobStatus.OPEN, EJobStatus.IN_PROGRESS);
                Map<Long, Long> jobCountMap = jobRepository.countJobsByCategory(activeStatuses).stream()
                                .collect(Collectors.toMap(
                                                JobRepository.CategoryJobCount::getCategoryId,
                                                JobRepository.CategoryJobCount::getCount));

                List<CategoryResponse> response = categories.stream()
                                .map(c -> {
                                        CategoryResponse dto = mapToCategoryResponseWithDetails(c);
                                        dto.setJobCount(jobCountMap.getOrDefault(c.getId(), 0L));
                                        return dto;
                                })
                                .collect(Collectors.toList());

                return ApiResponse.success("Lấy danh sách danh mục chi tiết với số lượng việc làm thành công",
                                response);
        }

        private CategoryResponse mapToCategoryResponse(Category category) {
                return CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .displayOrder(category.getDisplayOrder())
                                .icon(category.getIcon())
                                .build();
        }

        private CategoryResponse mapToCategoryResponseWithJobCount(Category category, Long jobCount) {
                return CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .displayOrder(category.getDisplayOrder())
                                .icon(category.getIcon())
                                .jobCount(jobCount)
                                .build();
        }

        private CategoryResponse mapToCategoryResponseWithDetails(Category category) {
                List<String> popularTags = category.getSubCategories().stream()
                                .flatMap(sc -> sc.getTags().stream())
                                .filter(SubCategoryTag::getIsPopular)
                                .sorted((t1, t2) -> t1.getDisplayOrder().compareTo(t2.getDisplayOrder()))
                                .map(SubCategoryTag::getName)
                                .collect(Collectors.toList());

                List<SubCategoryResponse> subCategories = category.getSubCategories().stream()
                                .filter(SubCategory::getIsActive)
                                .sorted((sc1, sc2) -> sc1.getDisplayOrder().compareTo(sc2.getDisplayOrder()))
                                .map(this::mapToSubCategoryResponse)
                                .collect(Collectors.toList());

                return CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .displayOrder(category.getDisplayOrder())
                                .icon(category.getIcon())
                                .popularTags(popularTags)
                                .subCategories(subCategories)
                                .build();
        }

        private SubCategoryResponse mapToSubCategoryResponse(SubCategory subCategory) {
                List<SubCategoryTagResponse> tags = subCategory.getTags().stream()
                                .filter(SubCategoryTag::getIsActive)
                                .sorted((t1, t2) -> t1.getDisplayOrder().compareTo(t2.getDisplayOrder()))
                                .map(this::mapToSubCategoryTagResponse)
                                .collect(Collectors.toList());

                return SubCategoryResponse.builder()
                                .id(subCategory.getId())
                                .name(subCategory.getName())
                                .displayOrder(subCategory.getDisplayOrder())
                                .tags(tags)
                                .build();
        }

        private SubCategoryTagResponse mapToSubCategoryTagResponse(SubCategoryTag tag) {
                return SubCategoryTagResponse.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .isPopular(tag.getIsPopular())
                                .displayOrder(tag.getDisplayOrder())
                                .build();
        }
}
