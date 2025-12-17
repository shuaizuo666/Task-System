package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for simple message responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    
    private String message;
}
