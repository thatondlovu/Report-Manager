package com.project.reportmanager.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Username or Student Number is required")
    String username,

    @NotBlank(message = "Password is required")
    String password
) {}