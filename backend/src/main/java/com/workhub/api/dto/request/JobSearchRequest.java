package com.workhub.api.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchRequest {

    private String keyword;           // Tìm trong title, description
    private String company;           // Tên công ty (employer.company)
    private String location;          // Địa điểm (job.location hoặc employer.location)
    private Set<String> skills;       // Tags/kỹ năng
    private String workType;          // PART_TIME, FULL_TIME
    private String complexity;        // ENTRY, INTERMEDIATE, EXPERT
    private Integer minBudget;        // Budget tối thiểu
    private Integer maxBudget;        // Budget tối đa
    
    @Min(0)
    @Builder.Default
    private Integer page = 0;
    
    @Min(1)
    @Builder.Default
    private Integer size = 10;
    
    @Builder.Default
    private String sortBy = "createdAt";
    
    @Builder.Default
    private String sortDir = "desc";
}
