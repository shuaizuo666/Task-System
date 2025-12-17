package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.exception.ConflictException;
import com.taskmanager.exception.UnauthorizedException;
import com.taskmanager.exception.ValidationException;
import com.taskmanager.model.TaskList;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskListRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

/**
 * Service for authentication operations
 * Handles user registration, login, and token management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final TaskListRepository taskListRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    /**
     * Register a new user
     * Validates email format, password length, and email uniqueness
     * Creates a default task list for the user
     * 
     * @param request registration request containing username, email, and password
     * @return the created user
     * @throws ValidationException if email format is invalid or password is too short
     * @throws ConflictException if email is already registered
     */
    @Transactional
    public User registerUser(RegisterRequest request) {
        log.debug("Attempting to register user with email: {}", request.getEmail());
        
        // Validate email format
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new ValidationException("邮箱格式不正确");
        }
        
        // Validate password length
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new ValidationException("密码长度至少为8个字符");
        }
        
        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("该邮箱已被注册");
        }
        
        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        
        // Create default task list
        createDefaultTaskList(savedUser);
        
        return savedUser;
    }
    
    /**
     * Authenticate user and generate JWT token
     * 
     * @param request login request containing email and password
     * @return authentication response with token and user info
     * @throws UnauthorizedException if credentials are invalid
     */
    @Transactional(readOnly = true)
    public AuthResponse authenticateUser(LoginRequest request) {
        log.debug("Attempting to authenticate user with email: {}", request.getEmail());
        
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("邮箱或密码错误"));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("邮箱或密码错误");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        log.info("User authenticated successfully: {}", user.getEmail());
        
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
    
    /**
     * Validate JWT token
     * 
     * @param token the JWT token to validate
     * @param email the email to validate against
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token, String email) {
        return jwtUtil.validateToken(token, email);
    }
    
    /**
     * Create default task list for a new user
     * 
     * @param user the user to create the default list for
     */
    private void createDefaultTaskList(User user) {
        TaskList defaultList = new TaskList();
        defaultList.setName("我的任务");
        defaultList.setUser(user);
        defaultList.setIsDefault(true);
        
        taskListRepository.save(defaultList);
        log.debug("Created default task list for user: {}", user.getId());
    }
}
