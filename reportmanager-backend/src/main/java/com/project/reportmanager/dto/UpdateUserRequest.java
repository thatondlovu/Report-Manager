package com.project.reportmanager.dto;

import com.project.reportmanager.enums.Department;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    String firstName,

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    String lastName,

    String gender,

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,

    @Pattern(regexp = "^[1-9][0-9]{8}$", message = "Student Number must be exactly 9 digits and cannot start with 0")
    String studentNumber,

    Department department,

    String oldPassword,

    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).+$",
        message = "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    String newPassword
) {}