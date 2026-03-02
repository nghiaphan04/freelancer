package com.workhub.api.repository;

import com.workhub.api.entity.EJobStatus;
import com.workhub.api.entity.EPendingBlockchainAction;
import com.workhub.api.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

        Page<Job> findByEmployerId(Long employerId, Pageable pageable);

        Page<Job> findByStatus(EJobStatus status, Pageable pageable);

        Page<Job> findByStatusOrderByCreatedAtDesc(EJobStatus status, Pageable pageable);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND (j.applicationDeadline IS NULL OR j.applicationDeadline > :now)")
        Page<Job> findByStatusAndNotExpired(@Param("status") EJobStatus status,
                        @Param("now") java.time.LocalDateTime now,
                        Pageable pageable);

        Page<Job> findByEmployerIdAndStatus(Long employerId, EJobStatus status, Pageable pageable);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND " +
                        "(j.applicationDeadline IS NULL OR j.applicationDeadline > :now) AND " +
                        "(LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
                        "LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
        Page<Job> searchJobs(@Param("keyword") String keyword,
                        @Param("status") EJobStatus status,
                        @Param("now") java.time.LocalDateTime now,
                        Pageable pageable);

        @Query("SELECT DISTINCT j FROM Job j JOIN j.skills s WHERE s IN :skills AND j.status = :status AND (j.applicationDeadline IS NULL OR j.applicationDeadline > :now)")
        Page<Job> findBySkillsAndStatus(@Param("skills") List<String> skills,
                        @Param("status") EJobStatus status,
                        @Param("now") java.time.LocalDateTime now,
                        Pageable pageable);

        long countByEmployerId(Long employerId);

        long countByEmployerIdAndStatus(Long employerId, EJobStatus status);

        // Count jobs by status (for admin)
        long countByStatus(EJobStatus status);

        // List jobs by status (for scheduler)
        List<Job> findByStatus(EJobStatus status);

        // Get all jobs with details for admin
        @Query("SELECT j FROM Job j JOIN FETCH j.employer ORDER BY j.createdAt DESC")
        Page<Job> findAllWithEmployer(Pageable pageable);

        // Get jobs by status with employer details for admin
        @Query("SELECT j FROM Job j JOIN FETCH j.employer WHERE j.status = :status ORDER BY j.createdAt DESC")
        Page<Job> findByStatusWithEmployer(@Param("status") EJobStatus status, Pageable pageable);

        // Timeout queries for scheduler
        @Query("SELECT j FROM Job j WHERE j.status = :status AND j.applicationDeadline IS NOT NULL AND j.applicationDeadline < :deadline")
        List<Job> findByStatusAndApplicationDeadlineBefore(@Param("status") EJobStatus status,
                        @Param("deadline") java.time.LocalDateTime deadline);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND j.workSubmissionDeadline IS NOT NULL AND j.workSubmissionDeadline < :deadline")
        List<Job> findByStatusAndWorkSubmissionDeadlineBefore(@Param("status") EJobStatus status,
                        @Param("deadline") java.time.LocalDateTime deadline);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND j.workReviewDeadline IS NOT NULL AND j.workReviewDeadline < :deadline")
        List<Job> findByStatusAndWorkReviewDeadlineBefore(@Param("status") EJobStatus status,
                        @Param("deadline") java.time.LocalDateTime deadline);

        // Freelancer's working jobs (jobs where freelancer has ACCEPTED application)
        @Query("SELECT j FROM Job j WHERE EXISTS (SELECT a FROM JobApplication a WHERE a.job = j AND a.freelancer.id = :freelancerId AND a.status = 'ACCEPTED')")
        Page<Job> findByAcceptedFreelancerId(@Param("freelancerId") Long freelancerId, Pageable pageable);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND EXISTS (SELECT a FROM JobApplication a WHERE a.job = j AND a.freelancer.id = :freelancerId AND a.status = 'ACCEPTED')")
        Page<Job> findByStatusAndAcceptedFreelancerId(@Param("status") EJobStatus status,
                        @Param("freelancerId") Long freelancerId, Pageable pageable);

        // Count freelancer's jobs by status
        @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status AND EXISTS (SELECT a FROM JobApplication a WHERE a.job = j AND a.freelancer.id = :freelancerId AND a.status = 'ACCEPTED')")
        long countByStatusAndAcceptedFreelancerId(@Param("status") EJobStatus status,
                        @Param("freelancerId") Long freelancerId);

        // Sum earnings for completed jobs
        @Query("SELECT COALESCE(SUM(j.budget), 0) FROM Job j WHERE j.status = 'COMPLETED' AND EXISTS (SELECT a FROM JobApplication a WHERE a.job = j AND a.freelancer.id = :freelancerId AND a.status = 'ACCEPTED')")
        long sumEarningsByAcceptedFreelancerId(@Param("freelancerId") Long freelancerId);

        // Find jobs with pending blockchain actions (for admin)
        Page<Job> findByPendingBlockchainActionNot(EPendingBlockchainAction action, Pageable pageable);

        @Query("SELECT j FROM Job j WHERE j.status = :status AND j.acceptedAt IS NOT NULL AND j.acceptedAt < :deadline")
        List<Job> findByStatusAndAcceptedAtBefore(@Param("status") EJobStatus status,
                        @Param("deadline") java.time.LocalDateTime deadline);

        List<Job> findByPendingBlockchainAction(EPendingBlockchainAction action);

        // Count jobs by category
        @Query("SELECT COUNT(j) FROM Job j WHERE j.category.id = :categoryId AND j.status IN :statuses")
        long countByCategoryIdAndStatuses(@Param("categoryId") Long categoryId,
                        @Param("statuses") List<EJobStatus> statuses);

        @Query("SELECT j.category.id as categoryId, COUNT(j) as count FROM Job j WHERE j.status IN :statuses GROUP BY j.category.id")
        List<CategoryJobCount> countJobsByCategory(@Param("statuses") List<EJobStatus> statuses);

        interface CategoryJobCount {
                Long getCategoryId();

                Long getCount();
        }

        // Advanced search with multiple criteria
        @Query("SELECT DISTINCT j FROM Job j JOIN j.employer e LEFT JOIN j.skills s WHERE " +
                        "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND "
                        +
                        "(:categoryId IS NULL OR j.category.id = :categoryId) AND "
                        +
                        "(:company IS NULL OR e.company LIKE CONCAT('%', CAST(:company AS string), '%')) AND " +
                        "(:location IS NULL OR j.location LIKE CONCAT('%', CAST(:location AS string), '%') OR e.location LIKE CONCAT('%', CAST(:location AS string), '%')) AND "
                        +
                        "(:skills IS NULL OR s IN :skills) AND " +
                        "(:workType IS NULL OR j.workType = :workType) AND " +
                        "(:complexity IS NULL OR j.complexity = :complexity) AND " +
                        "(:minBudget IS NULL OR j.budget >= :minBudget) AND " +
                        "(:maxBudget IS NULL OR j.budget <= :maxBudget) AND " +
                        "j.status IN :statuses AND " +
                        "(j.applicationDeadline IS NULL OR j.applicationDeadline > :now)")
        Page<Job> advancedSearch(
                        @Param("keyword") String keyword,
                        @Param("categoryId") Long categoryId,
                        @Param("company") String company,
                        @Param("location") String location,
                        @Param("skills") java.util.Set<String> skills,
                        @Param("workType") com.workhub.api.entity.EWorkType workType,
                        @Param("complexity") com.workhub.api.entity.EJobComplexity complexity,
                        @Param("minBudget") java.math.BigDecimal minBudget,
                        @Param("maxBudget") java.math.BigDecimal maxBudget,
                        @Param("statuses") List<EJobStatus> statuses,
                        @Param("now") java.time.LocalDateTime now,
                        Pageable pageable);
}
