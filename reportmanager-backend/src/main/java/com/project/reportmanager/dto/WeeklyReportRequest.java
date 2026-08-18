package com.project.reportmanager.dto;

import com.project.reportmanager.enums.ReportStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record WeeklyReportRequest(
    UUID id,

    @NotNull(message = "Week number is required")
    @Min(value = 1, message = "Week number must be 1 or greater")
    Integer weekNumber,

    @NotNull(message = "Start date is required")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    LocalDate endDate,

    String mondayText,
    String tuesdayText,
    String wednesdayText,
    String thursdayText,
    String fridayText,
    String challenges,

    ReportStatus status,

    @NotNull(message = "User ID is required")
    UUID userId
) {}