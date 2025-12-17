package com.taskmanager.controller;

import com.taskmanager.dto.MessageResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.security.JwtUtil;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for task management
 * Requirements: 3.1, 5.1, 6.1, 7.1
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    private final TaskService taskService;
    private final JwtUtil jwtUtil;
    
    /**
     * Create a new task
     * Requirement 3.1
     * 
     * @param taskRequest the task data
     * @param token the JWT token
     * @return the created task
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest taskRequest,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        TaskResponse response = taskService.createTask(taskRequest, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get all tasks for the current user with pagination and optional filters
     * Requirements: 5.1, 8.1, 9.1, 10.1, 13.1
     * 
     * @param page the page number (default 0)
     * @param size the page size (default 20)
     * @param status optional status filter
     * @param priority optional priority filter
     * @param search optional search term
     * @param listId optional list ID filter
     * @param token the JWT token
     * @return page of tasks
     */
    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long listId,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        
        // Parse status and priority enums if provided
        com.taskmanager.model.TaskStatus taskStatus = null;
        com.taskmanager.model.TaskPriority taskPriority = null;
        
        if (status != null && !status.trim().isEmpty()) {
            try {
                taskStatus = com.taskmanager.model.TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status value - ignore or could throw validation exception
            }
        }
        
        if (priority != null && !priority.trim().isEmpty()) {
            try {
                taskPriority = com.taskmanager.model.TaskPriority.valueOf(priority.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid priority value - ignore or could throw validation exception
            }
        }
        
        // Use filtered method if any filters are provided
        Page<TaskResponse> tasks;
        
        // Filter by list ID if provided (Requirement 13.1)
        if (listId != null) {
            tasks = taskService.getTasksByListId(userId, listId, page, size);
        } else if (taskStatus != null || taskPriority != null || (search != null && !search.trim().isEmpty())) {
            tasks = taskService.getTasksWithFilters(userId, taskStatus, taskPriority, search, page, size);
        } else {
            tasks = taskService.getAllTasks(userId, page, size);
        }
        
        return ResponseEntity.ok(tasks);
    }
    
    /**
     * Get a task by ID
     * Requirement 5.1
     * 
     * @param id the task ID
     * @param token the JWT token
     * @return the task
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        TaskResponse response = taskService.getTaskById(id, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update a task
     * Requirement 6.1
     * 
     * @param id the task ID
     * @param taskRequest the updated task data
     * @param token the JWT token
     * @return the updated task
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest taskRequest,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        TaskResponse response = taskService.updateTask(id, taskRequest, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a task
     * Requirement 7.1
     * 
     * @param id the task ID
     * @param token the JWT token
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTask(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        Long userId = getUserIdFromToken(token);
        taskService.deleteTask(id, userId);
        
        return ResponseEntity.ok(new MessageResponse("任务删除成功"));
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
