package com.project.reportmanager.dto;

import com.project.reportmanager.enums.Department;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    String username,

    @NotBlank(message = "Student Number is required")
    @Pattern(regexp = "^[1-9][0-9]{8}$", message = "Student Number must be exactly 9 digits and cannot start with 0")
    String studentNumber,

    @NotNull(message = "Department is required")
    Department department,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).+$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    String password
) {}