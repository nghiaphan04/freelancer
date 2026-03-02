package com.workhub.api.repository;

import com.workhub.api.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    List<SubCategory> findAllByCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long categoryId);

    Optional<SubCategory> findByIdAndIsActiveTrue(Long id);

    boolean existsByNameAndCategoryId(String name, Long categoryId);
}
