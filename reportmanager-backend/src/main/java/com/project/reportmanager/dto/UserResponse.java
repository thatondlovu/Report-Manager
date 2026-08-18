package com.project.reportmanager.dto;

import com.project.reportmanager.enums.Department;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String username,
    String studentNumber,
    Department department
) {}