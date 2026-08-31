package com.project.reportmanager.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.reportmanager.enums.ReportStatus;
import com.project.reportmanager.model.WeeklyReport;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {

    @Query("SELECT r FROM WeeklyReport r WHERE r.user.id = :userId ORDER BY r.weekNumber ASC")
    List<WeeklyReport> findByUserIdOrderByWeekNumberAsc(@Param("userId") UUID userId);

    @Query("SELECT r FROM WeeklyReport r WHERE r.user.id = :userId AND r.weekNumber = :weekNumber")
    Optional<WeeklyReport> findByUserIdAndWeekNumber(@Param("userId") UUID userId, @Param("weekNumber") Integer weekNumber);

    @Query("SELECT r FROM WeeklyReport r WHERE r.user.id = :userId AND r.startDate <= :endDate AND r.endDate >= :startDate")
    List<WeeklyReport> findOverlappingReports(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(r) FROM WeeklyReport r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(r) FROM WeeklyReport r WHERE r.user.id = :userId AND r.status = :status")
    long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") ReportStatus status);
}