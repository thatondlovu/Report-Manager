package com.project.reportmanager.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.reportmanager.model.WeeklyReport;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {
    
    List<WeeklyReport> findByUserId(Long userId);
}