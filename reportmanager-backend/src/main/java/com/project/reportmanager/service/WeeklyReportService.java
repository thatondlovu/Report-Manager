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

    
    public WeeklyReport saveReport(WeeklyReport report) {
        return weeklyReportRepository.save(report);
    }

    
    public List<WeeklyReport> getReportsByUser(Long userId) {
        return weeklyReportRepository.findByUserId(userId);
    }

    
    public WeeklyReport getReportById(Long id) {
        return weeklyReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with ID: " + id));
    }

    
    public void deleteReport(Long id) {
        weeklyReportRepository.deleteById(id);
    }
}