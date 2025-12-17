package com.taskmanager.controller;

import com.taskmanager.dto.MessageResponse;
import com.taskmanager.dto.TaskListRequest;
import com.taskmanager.dto.TaskListResponse;
import com.taskmanager.security.JwtUtil;
import com.taskmanager.service.TaskListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for task list management
 * Requirements: 11.1, 14.1, 14.2
 */
@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class TaskListController {
    
    private final TaskListService taskListService;
    private final JwtUtil jwtUtil;
    
    /**
     * Create a new task list
     * POST /api/lists
     * Requirement: 11.1
     * 
     * @param request the task list data
     * @param token the JWT token
     * @return the created task list
     */
    @PostMapping
    public ResponseEntity<TaskListResponse> createList(
            @Valid @RequestBody TaskListRequest request,
            @RequestHeader("Authorization") String token) {
        
        Long userId = jwtUtil.extractUserId(token.substring(7));
        TaskListResponse response = taskListService.createList(request, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get all task lists for the current user
     * GET /api/lists
     * Requirement: 11.1
     * 
     * @param token the JWT token
     * @return list of task lists
     */
    @GetMapping
    public ResponseEntity<List<TaskListResponse>> getAllLists(
            @RequestHeader("Authorization") String token) {
        
        Long userId = jwtUtil.extractUserId(token.substring(7));
        List<TaskListResponse> lists = taskListService.getAllLists(userId);
        
        return ResponseEntity.ok(lists);
    }
    
    /**
     * Get a task list by ID
     * GET /api/lists/{id}
     * 
     * @param id the list ID
     * @param token the JWT token
     * @return the task list
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskListResponse> getListById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        Long userId = jwtUtil.extractUserId(token.substring(7));
        TaskListResponse response = taskListService.getListById(id, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update a task list
     * PUT /api/lists/{id}
     * Requirement: 14.1
     * 
     * @param id the list ID
     * @param request the updated task list data
     * @param token the JWT token
     * @return the updated task list
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskListResponse> updateList(
            @PathVariable Long id,
            @Valid @RequestBody TaskListRequest request,
            @RequestHeader("Authorization") String token) {
        
        Long userId = jwtUtil.extractUserId(token.substring(7));
        TaskListResponse response = taskListService.updateList(id, request, userId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete a task list
     * DELETE /api/lists/{id}
     * Requirement: 14.2
     * 
     * @param id the list ID
     * @param token the JWT token
     * @return success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteList(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        
        Long userId = jwtUtil.extractUserId(token.substring(7));
        taskListService.deleteList(id, userId);
        
        return ResponseEntity.ok(new MessageResponse("任务列表删除成功"));
    }
}
