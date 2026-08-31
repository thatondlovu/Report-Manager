package com.project.reportmanager.service;

import java.util.List;
import java.util.UUID;

import com.project.reportmanager.dto.DashboardStatsResponse;
import com.project.reportmanager.dto.WeeklyReportRequest;
import com.project.reportmanager.dto.WeeklyReportResponse;

public interface WeeklyReportService {
    WeeklyReportResponse saveOrUpdateReport(WeeklyReportRequest request);
    List<WeeklyReportResponse> getReportsByUserId(UUID userId);
    WeeklyReportResponse getReportById(UUID reportId);
    void deleteReport(UUID reportId, UUID requestingUserId);
    DashboardStatsResponse getDashboardStats(UUID userId);
}