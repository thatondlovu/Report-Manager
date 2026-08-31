package com.project.reportmanager.dto;

import com.project.reportmanager.enums.ReportStatus;

import java.time.LocalDate;
import java.util.UUID;

public record WeeklyReportResponse(
    UUID id,
    Integer weekNumber,
    LocalDate startDate,
    LocalDate endDate,
    String mondayText,
    String tuesdayText,
    String wednesdayText,
    String thursdayText,
    String fridayText,
    String challenges,
    ReportStatus status,
    UUID userId
) {}