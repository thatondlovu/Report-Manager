package com.project.reportmanager.service;

import com.project.reportmanager.dto.LoginRequest;
import com.project.reportmanager.dto.RegisterUserRequest;
import com.project.reportmanager.dto.UpdateUserRequest;
import com.project.reportmanager.dto.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse registerUser(RegisterUserRequest request);
    UserResponse loginUser(LoginRequest request);
    UserResponse getUserById(UUID id);
    UserResponse updateUser(UUID id, UpdateUserRequest request);
}