package com.project.reportmanager.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.reportmanager.model.WeeklyReport;
import com.project.reportmanager.repository.WeeklyReportRepository;

@Service
public class WeeklyReportService {

    @Autowired
    private WeeklyReportRepository weeklyReportRepository;

    // Save or update a weekly report
    public WeeklyReport saveReport(WeeklyReport report) {
        return weeklyReportRepository.save(report);
    }

    // Get all reports created by a specific user
    public List<WeeklyReport> getReportsByUser(Long userId) {
        return weeklyReportRepository.findByUserId(userId);
    }

    // Get a specific report by its ID
    public WeeklyReport getReportById(Long id) {
        return weeklyReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + id));
    }

    // Delete a report
    public void deleteReport(Long id) {
        weeklyReportRepository.deleteById(id);
    }
}