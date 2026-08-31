package com.project.reportmanager.dto;

public record DashboardStatsResponse(
    long totalReports,
    long draftCount,
    long submittedCount
) {}