package com.project.reportmanager.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.reportmanager.model.WeeklyReport;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    List<WeeklyReport> findByUserId(UUID userId);
}