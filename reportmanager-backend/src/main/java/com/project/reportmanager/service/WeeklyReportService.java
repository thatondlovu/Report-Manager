package com.project.reportmanager.service;

import com.project.reportmanager.dto.WeeklyReportRequest;
import com.project.reportmanager.dto.WeeklyReportResponse;

import java.util.List;
import java.util.UUID;

public interface WeeklyReportService {
    WeeklyReportResponse saveOrUpdateReport(WeeklyReportRequest request);
    List<WeeklyReportResponse> getReportsByUserId(UUID userId);
    WeeklyReportResponse getReportById(UUID reportId);
    void deleteReport(UUID reportId, UUID requestingUserId);
}