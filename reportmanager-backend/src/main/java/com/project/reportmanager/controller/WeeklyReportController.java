package com.project.reportmanager.controller;

import com.project.reportmanager.dto.WeeklyReportRequest;
import com.project.reportmanager.dto.WeeklyReportResponse;
import com.project.reportmanager.service.WeeklyReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    @PostMapping
    public ResponseEntity<WeeklyReportResponse> saveOrUpdateReport(@Valid @RequestBody WeeklyReportRequest request) {
        return new ResponseEntity<>(weeklyReportService.saveOrUpdateReport(request), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WeeklyReportResponse>> getReportsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(weeklyReportService.getReportsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyReportResponse> getReportById(@PathVariable UUID id) {
        return ResponseEntity.ok(weeklyReportService.getReportById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        weeklyReportService.deleteReport(id, userId);
        return ResponseEntity.noContent().build();
    }
}