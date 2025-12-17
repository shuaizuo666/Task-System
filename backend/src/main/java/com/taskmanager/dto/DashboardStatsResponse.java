package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for dashboard statistics
 * Requirements: 15.1, 15.2, 15.3, 15.4
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    
    /**
     * Total number of tasks for the user
     * Requirement: 15.1
     */
    private long totalTasks;
    
    /**
     * Number of tasks with TODO status
     * Requirement: 15.2
     */
    private long todoCount;
    
    /**
     * Number of tasks with IN_PROGRESS status
     * Requirement: 15.2
     */
    private long inProgressCount;
    
    /**
     * Number of tasks with COMPLETED status
     * Requirement: 15.2
     */
    private long completedCount;
    
    /**
     * Number of tasks due today
     * Requirement: 15.3
     */
    private long dueTodayCount;
    
    /**
     * Number of overdue tasks (due date before today and not completed)
     * Requirement: 15.4
     */
    private long overdueCount;
}
