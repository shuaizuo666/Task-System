package com.taskmanager.controller;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.MessageResponse;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.model.User;
import com.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints
 * Handles user registration, login, and logout
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Register a new user
     * POST /api/auth/register
     * 
     * @param request registration request with username, email, and password
     * @return message response with user ID
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        
        User user = authService.registerUser(request);
        
        MessageResponse response = new MessageResponse(
            "用户注册成功，用户ID: " + user.getId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Login user
     * POST /api/auth/login
     * 
     * @param request login request with email and password
     * @return authentication response with JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        
        AuthResponse response = authService.authenticateUser(request);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Logout user
     * POST /api/auth/logout
     * 
     * Note: JWT tokens are stateless, so logout is handled client-side
     * by removing the token. This endpoint is provided for consistency
     * and can be extended to implement token blacklisting if needed.
     * 
     * @param authorization the Authorization header with Bearer token
     * @return message response
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        log.info("Logout request received");
        
        // In a stateless JWT implementation, logout is handled client-side
        // The client should remove the token from storage
        // This endpoint can be extended to implement token blacklisting if needed
        
        MessageResponse response = new MessageResponse("登出成功");
        return ResponseEntity.ok(response);
    }
}
