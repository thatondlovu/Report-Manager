package com.project.reportmanager.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.reportmanager.dto.DashboardStatsResponse;
import com.project.reportmanager.dto.WeeklyReportRequest;
import com.project.reportmanager.dto.WeeklyReportResponse;
import com.project.reportmanager.enums.ReportStatus;
import com.project.reportmanager.exception.ResourceNotFoundException;
import com.project.reportmanager.exception.UnauthorizedAccessException;
import com.project.reportmanager.model.User;
import com.project.reportmanager.model.WeeklyReport;
import com.project.reportmanager.repository.UserRepository;
import com.project.reportmanager.repository.WeeklyReportRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WeeklyReportServiceImpl implements WeeklyReportService {

    private final WeeklyReportRepository weeklyReportRepository;
    private final UserRepository userRepository;

    private static final int MIN_LOG_LENGTH = 15;

    @Override
    @Transactional
    public WeeklyReportResponse saveOrUpdateReport(WeeklyReportRequest request) {
        if (request.weekNumber() == null || request.weekNumber() <= 0) {
            throw new IllegalArgumentException("Week number must be 1 or greater.");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new IllegalArgumentException("Start date and End date are required.");
        }
        if (request.startDate().isAfter(request.endDate())) {
            throw new IllegalArgumentException("Start date cannot be after End date.");
        }

        // 1. Fetch user's existing reports to validate duplicates and overlaps
        List<WeeklyReport> userReports = weeklyReportRepository.findByUserIdOrderByWeekNumberAsc(request.userId());

        for (WeeklyReport existing : userReports) {
            boolean isSelf = request.id() != null && existing.getId().equals(request.id());
            if (isSelf) continue;

            // Check Duplicate Week Number
            if (existing.getWeekNumber().equals(request.weekNumber())) {
                throw new IllegalArgumentException("Week " + request.weekNumber() + " has already been recorded.");
            }

            // Check Overlapping Date Range
            boolean overlaps = !request.startDate().isAfter(existing.getEndDate()) &&
                               !request.endDate().isBefore(existing.getStartDate());
            if (overlaps) {
                throw new IllegalArgumentException("Selected date range overlaps with Week " + existing.getWeekNumber() + ".");
            }
        }

        WeeklyReport report;

        if (request.id() != null) {
            report = weeklyReportRepository.findById(request.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + request.id()));

            if (!report.getUser().getId().equals(request.userId())) {
                throw new UnauthorizedAccessException("You do not have permission to modify this report");
            }

            if (report.getStatus() == ReportStatus.SUBMITTED) {
                throw new IllegalStateException("Submitted reports are locked and cannot be edited.");
            }
        } else {
            report = new WeeklyReport();
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.userId()));
            report.setUser(user);
        }

        if (request.status() == ReportStatus.SUBMITTED) {
            validateSubmittedReportContent(request);
        }

        report.setWeekNumber(request.weekNumber());
        report.setStartDate(request.startDate());
        report.setEndDate(request.endDate());
        report.setMondayText(request.mondayText());
        report.setTuesdayText(request.tuesdayText());
        report.setWednesdayText(request.wednesdayText());
        report.setThursdayText(request.thursdayText());
        report.setFridayText(request.fridayText());
        report.setChallenges(request.challenges());
        report.setStatus(request.status() != null ? request.status() : ReportStatus.DRAFT);

        WeeklyReport saved = weeklyReportRepository.save(report);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyReportResponse> getReportsByUserId(UUID userId) {
        return weeklyReportRepository.findByUserIdOrderByWeekNumberAsc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyReportResponse getReportById(UUID reportId) {
        WeeklyReport report = weeklyReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public void deleteReport(UUID reportId, UUID requestingUserId) {
        WeeklyReport report = weeklyReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        if (!report.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this report");
        }

        if (report.getStatus() == ReportStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted reports are locked and cannot be deleted.");
        }

        weeklyReportRepository.delete(report);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(UUID userId) {
        long total = weeklyReportRepository.countByUserId(userId);
        long drafts = weeklyReportRepository.countByUserIdAndStatus(userId, ReportStatus.DRAFT);
        long submitted = weeklyReportRepository.countByUserIdAndStatus(userId, ReportStatus.SUBMITTED);

        return new DashboardStatsResponse(total, drafts, submitted);
    }

    /**
     * Validates that daily logs falling within the selected start and end dates meet the required length.
     */
    private void validateSubmittedReportContent(WeeklyReportRequest request) {
        if (request.startDate() == null || request.endDate() == null) {
            throw new IllegalArgumentException("Start date and End date are required to submit a report.");
        }

        LocalDate current = request.startDate();
        LocalDate end = request.endDate();

        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            switch (day) {
                case MONDAY -> validateDayText("Monday", request.mondayText());
                case TUESDAY -> validateDayText("Tuesday", request.tuesdayText());
                case WEDNESDAY -> validateDayText("Wednesday", request.wednesdayText());
                case THURSDAY -> validateDayText("Thursday", request.thursdayText());
                case FRIDAY -> validateDayText("Friday", request.fridayText());
                default -> {}
            }
            current = current.plusDays(1);
        }
    }

    private void validateDayText(String dayName, String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException(dayName + " log is required before submitting.");
        }
        if (text.trim().length() < MIN_LOG_LENGTH) {
            throw new IllegalArgumentException(dayName + " log must be at least " + MIN_LOG_LENGTH + " characters long.");
        }
    }

    private WeeklyReportResponse mapToResponse(WeeklyReport report) {
        UUID userId = (report.getUser() != null) ? report.getUser().getId() : null;

        return new WeeklyReportResponse(
                report.getId(),
                report.getWeekNumber(),
                report.getStartDate(),
                report.getEndDate(),
                report.getMondayText(),
                report.getTuesdayText(),
                report.getWednesdayText(),
                report.getThursdayText(),
                report.getFridayText(),
                report.getChallenges(),
                report.getStatus(),
                userId
        );
    }
}