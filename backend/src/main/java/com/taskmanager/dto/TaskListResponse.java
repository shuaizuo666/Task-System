package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for task list response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskListResponse {
    
    private Long id;
    
    private String name;
    
    private Long userId;
    
    private Boolean isDefault;
    
    private Integer taskCount;
    
    private LocalDateTime createdAt;
}
