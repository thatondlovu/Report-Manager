package com.project.reportmanager.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "weekly_reports") 
@Data 
public class WeeklyReport { 

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @Column(nullable = false)
    private Integer weekNumber; 

    @Column(nullable = false)
    private LocalDate startDate; 

    @Column(nullable = false)
    private LocalDate endDate; 

    @Column(columnDefinition = "TEXT")
    private String mondayText;

    @Column(columnDefinition = "TEXT")
    private String tuesdayText;

    @Column(columnDefinition = "TEXT")
    private String wednesdayText;

    @Column(columnDefinition = "TEXT")
    private String thursdayText;

    @Column(columnDefinition = "TEXT")
    private String fridayText;

    @Column(columnDefinition = "TEXT")
    private String challenges; 

    @Column(nullable = false)
    private String status = "DRAFT"; 

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;
}