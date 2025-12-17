package com.taskmanager.controller;

import com.taskmanager.dto.DashboardStatsResponse;
import com.taskmanager.security.JwtUtil;
import com.taskmanager.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for statistics
 * Requirement: 15.1
 */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    private final JwtUtil jwtUtil;
    
    /**
     * Get dashboard statistics for the current user
     * Requirement: 15.1
     * 
     * @param token the JWT token
     * @return dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        DashboardStatsResponse stats = statisticsService.getDashboardStats(userId);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Extract user ID from JWT token
     * 
     * @param token the authorization header value
     * @return the user ID
     */
    private Long getUserIdFromToken(String token) {
        String jwt = token.replace("Bearer ", "");
        return jwtUtil.extractUserId(jwt);
    }
}
