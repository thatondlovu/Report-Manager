package com.project.reportmanager.service;

import com.project.reportmanager.dto.LoginRequest;
import com.project.reportmanager.dto.RegisterUserRequest;
import com.project.reportmanager.dto.UpdateUserRequest;
import com.project.reportmanager.dto.UserResponse;
import com.project.reportmanager.exception.InvalidCredentialsException;
import com.project.reportmanager.exception.ResourceNotFoundException;
import com.project.reportmanager.exception.UserAlreadyExistsException;
import com.project.reportmanager.model.User;
import com.project.reportmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse registerUser(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username is already taken: " + request.username());
        }

        if (userRepository.existsByStudentNumber(request.studentNumber())) {
            throw new UserAlreadyExistsException("Student number is already registered: " + request.studentNumber());
        }

        User user = new User();
        user.setUsername(request.username());
        user.setStudentNumber(request.studentNumber());
        user.setDepartment(request.department());
        user.setPassword(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse loginUser(LoginRequest request) {
        // Allows login using username OR student number
        User user = userRepository.findByUsername(request.username())
                .or(() -> userRepository.findByStudentNumber(request.username()))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username/student number or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username/student number or password");
        }

        return mapToResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (request.username() != null && !request.username().isBlank()) {
            if (!user.getUsername().equals(request.username()) && userRepository.existsByUsername(request.username())) {
                throw new UserAlreadyExistsException("Username is already taken: " + request.username());
            }
            user.setUsername(request.username());
        }

        if (request.studentNumber() != null && !request.studentNumber().isBlank()) {
            if (!user.getStudentNumber().equals(request.studentNumber()) && userRepository.existsByStudentNumber(request.studentNumber())) {
                throw new UserAlreadyExistsException("Student number is already registered: " + request.studentNumber());
            }
            user.setStudentNumber(request.studentNumber());
        }

        if (request.department() != null) {
            user.setDepartment(request.department());
        }

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.oldPassword() == null || !passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
                throw new InvalidCredentialsException("Current password does not match");
            }
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getStudentNumber(),
                user.getDepartment()
        );
    }
}