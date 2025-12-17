package com.taskmanager.service;

import com.taskmanager.dto.DashboardStatsResponse;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Service for managing statistics
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */
@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final TaskRepository taskRepository;
    
    /**
     * Get dashboard statistics for a user
     * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
     * 
     * @param userId the user ID
     * @return dashboard statistics
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long userId) {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        
        // Calculate total tasks (Requirement 15.1)
        // Ensures user data isolation (Requirement 15.5)
        long totalTasks = taskRepository.countByUserId(userId);
        stats.setTotalTasks(totalTasks);
        
        // Calculate tasks by status (Requirement 15.2)
        // Ensures user data isolation (Requirement 15.5)
        long todoCount = taskRepository.countByUserIdAndStatus(userId, TaskStatus.TODO);
        long inProgressCount = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long completedCount = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        
        stats.setTodoCount(todoCount);
        stats.setInProgressCount(inProgressCount);
        stats.setCompletedCount(completedCount);
        
        // Calculate tasks due today (Requirement 15.3)
        // Ensures user data isolation (Requirement 15.5)
        LocalDate today = LocalDate.now();
        long dueTodayCount = taskRepository.findByUserIdAndDueDate(userId, today).size();
        stats.setDueTodayCount(dueTodayCount);
        
        // Calculate overdue tasks (Requirement 15.4)
        // Overdue = due date before today AND status is not COMPLETED
        // Ensures user data isolation (Requirement 15.5)
        long overdueCount = taskRepository.findOverdueTasks(userId, today, TaskStatus.COMPLETED).size();
        stats.setOverdueCount(overdueCount);
        
        return stats;
    }
}
