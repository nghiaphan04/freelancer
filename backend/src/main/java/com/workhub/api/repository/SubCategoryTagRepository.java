package com.workhub.api.repository;

import com.workhub.api.entity.SubCategoryTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryTagRepository extends JpaRepository<SubCategoryTag, Long> {

    List<SubCategoryTag> findAllBySubCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long subCategoryId);

    List<SubCategoryTag> findAllBySubCategoryIdAndIsPopularTrueAndIsActiveTrueOrderByDisplayOrderAsc(Long subCategoryId);

    boolean existsByNameAndSubCategoryId(String name, Long subCategoryId);
}
