package com.project.reportmanager.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.reportmanager.model.WeeklyReport;
import com.project.reportmanager.service.WeeklyReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*") // Allows React to make API requests safely
public class WeeklyReportController {

    @Autowired
    private WeeklyReportService weeklyReportService;

    // Create or Update a report
    @PostMapping
    public ResponseEntity<WeeklyReport> createOrUpdateReport(@RequestBody WeeklyReport report) {
        return ResponseEntity.ok(weeklyReportService.saveReport(report));
    }

    // Get all reports for a specific student/user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeeklyReport>> getReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(weeklyReportService.getReportsByUser(userId));
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReport> getReportById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(weeklyReportService.getReportById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            weeklyReportService.deleteReport(id);
            return ResponseEntity.ok("Report deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}