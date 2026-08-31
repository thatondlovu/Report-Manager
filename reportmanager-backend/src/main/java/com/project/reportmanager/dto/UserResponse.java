package com.project.reportmanager.dto;

import java.util.UUID;

import com.project.reportmanager.enums.Department;

public record UserResponse(
    UUID id,
    String firstName,
    String lastName,
    String gender,
    String username,
    String studentNumber,
    Department department
) {}