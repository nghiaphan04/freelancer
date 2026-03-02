package com.workhub.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private Integer displayOrder;
    private String icon;
    private Long jobCount;
    private List<String> popularTags;
    private List<SubCategoryResponse> subCategories;
}
