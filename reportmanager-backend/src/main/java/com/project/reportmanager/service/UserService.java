package com.project.reportmanager.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.reportmanager.model.User;
import com.project.reportmanager.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        validatePassword(user.getPassword());

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.findByStudentNumber(user.getStudentNumber()).isPresent()) {
            throw new RuntimeException("An account with this student number already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User loginUser(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent() && passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) {
            return userOpt.get();
        }
        throw new RuntimeException("Invalid username or password");
    }

    public User updateUser(Long id, Map<String, String> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (payload.get("username") != null) {
            user.setUsername(payload.get("username"));
        }

        if (payload.get("studentNumber") != null && !payload.get("studentNumber").toString().trim().isEmpty()) {
            try {
                int studentNum = Integer.parseInt(payload.get("studentNumber").toString().trim());
                user.setStudentNumber(studentNum);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Student number must contain digits only!");
            }
        }

        if (payload.get("department") != null) {
            user.setDepartment(payload.get("department"));
        }

        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (oldPassword != null && newPassword != null && !newPassword.trim().isEmpty()) {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new RuntimeException("Previous password is incorrect!");
            }

            validatePassword(newPassword);

            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(user);
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long.");
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSymbol = false;

        for (int i = 0; i < password.length(); i++) {
            char ch = password.charAt(i);

            if (Character.isUpperCase(ch)) {
                hasUpper = true;
            } else if (Character.isLowerCase(ch)) {
                hasLower = true;
            } else if (Character.isDigit(ch)) {
                hasDigit = true;
            } else {
                hasSymbol = true;
            }
        }

        if (!hasUpper) {
            throw new RuntimeException("Password must contain at least one uppercase letter.");
        }
        if (!hasLower) {
            throw new RuntimeException("Password must contain at least one lowercase letter.");
        }
        if (!hasDigit) {
            throw new RuntimeException("Password must contain at least one number.");
        }
        if (!hasSymbol) {
            throw new RuntimeException("Password must contain at least one special symbol (e.g., @, #, $, !).");
        }
    }
}