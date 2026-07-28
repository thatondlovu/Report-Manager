package com.project.reportmanager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.reportmanager.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);    
    Optional<User> findByStudentNumber(int studentNumber);
    boolean existsByUsername(String username);
    boolean existsByStudentNumber(int studentNumber);
}