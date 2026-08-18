package com.project.reportmanager.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeeklyReportServiceImpl implements WeeklyReportService {

    private final WeeklyReportRepository weeklyReportRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WeeklyReportResponse saveOrUpdateReport(WeeklyReportRequest request) {
        WeeklyReport report;

        if (request.id() != null) {
            report = weeklyReportRepository.findById(request.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + request.id()));

            if (!report.getUser().getId().equals(request.userId())) {
                throw new UnauthorizedAccessException("You do not have permission to modify this report");
            }
        } else {
            report = new WeeklyReport();
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.userId()));
            report.setUser(user);
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
        return weeklyReportRepository.findByUserId(userId)
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

        weeklyReportRepository.delete(report);
    }

    private WeeklyReportResponse mapToResponse(WeeklyReport report) {
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
                report.getUser().getId()
        );
    }
}