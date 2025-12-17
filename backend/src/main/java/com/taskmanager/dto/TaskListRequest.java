package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a task list
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskListRequest {
    
    @NotBlank(message = "列表名称不能为空")
    @Size(max = 100, message = "列表名称不能超过100个字符")
    private String name;
}
