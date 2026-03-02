package com.workhub.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubCategoryTagResponse {

    private Long id;
    private String name;
    private Boolean isPopular;
    private Integer displayOrder;
}
