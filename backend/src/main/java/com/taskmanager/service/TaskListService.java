package com.taskmanager.service;

import com.taskmanager.dto.TaskListRequest;
import com.taskmanager.dto.TaskListResponse;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.exception.ValidationException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskList;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskListRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing task lists
 */
@Service
@RequiredArgsConstructor
public class TaskListService {
    
    private final TaskListRepository taskListRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    
    /**
     * Create a new task list
     * Requirements: 11.1, 11.2
     * 
     * @param request the task list data
     * @param userId the user ID
     * @return the created task list
     */
    @Transactional
    public TaskListResponse createList(TaskListRequest request, Long userId) {
        // Validate name is not empty (Requirement 11.2)
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("列表名称不能为空");
        }
        
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        
        // Create task list
        TaskList taskList = new TaskList();
        taskList.setName(request.getName().trim());
        taskList.setUser(user);
        taskList.setIsDefault(false);
        
        // Save task list (Requirement 11.1)
        TaskList savedList = taskListRepository.save(taskList);
        
        return mapToResponse(savedList);
    }
    
    /**
     * Get all task lists for a user
     * Requirements: 11.5
     * 
     * @param userId the user ID
     * @return list of task lists
     */
    @Transactional(readOnly = true)
    public List<TaskListResponse> getAllLists(Long userId) {
        // Get lists for user only (user isolation - Requirement 11.5)
        List<TaskList> lists = taskListRepository.findByUserId(userId);
        
        return lists.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get a task list by ID
     * Requirements: 11.5
     * 
     * @param listId the list ID
     * @param userId the user ID
     * @return the task list
     */
    @Transactional(readOnly = true)
    public TaskListResponse getListById(Long listId, Long userId) {
        TaskList taskList = taskListRepository.findById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("任务列表不存在"));
        
        // Verify ownership (Requirement 11.5)
        if (!taskList.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权访问该任务列表");
        }
        
        return mapToResponse(taskList);
    }
    
    /**
     * Update a task list
     * Requirements: 14.1
     * 
     * @param listId the list ID
     * @param request the updated task list data
     * @param userId the user ID
     * @return the updated task list
     */
    @Transactional
    public TaskListResponse updateList(Long listId, TaskListRequest request, Long userId) {
        TaskList taskList = taskListRepository.findById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("任务列表不存在"));
        
        // Verify ownership
        if (!taskList.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权编辑该任务列表");
        }
        
        // Validate name is not empty
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("列表名称不能为空");
        }
        
        // Update name (Requirement 14.1)
        taskList.setName(request.getName().trim());
        
        TaskList updatedList = taskListRepository.save(taskList);
        
        return mapToResponse(updatedList);
    }
    
    /**
     * Delete a task list
     * Requirements: 14.2, 14.3, 14.4
     * 
     * @param listId the list ID
     * @param userId the user ID
     */
    @Transactional
    public void deleteList(Long listId, Long userId) {
        TaskList taskList = taskListRepository.findById(listId)
            .orElseThrow(() -> new ResourceNotFoundException("任务列表不存在"));
        
        // Verify ownership
        if (!taskList.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权删除该任务列表");
        }
        
        // Prevent deletion of default list (Requirement 14.4)
        if (taskList.getIsDefault()) {
            throw new ValidationException("不能删除默认列表");
        }
        
        // Migrate tasks to default list (Requirement 14.3)
        List<Task> tasksInList = taskRepository.findByTaskListId(listId);
        
        if (!tasksInList.isEmpty()) {
            // Get default list
            TaskList defaultList = taskListRepository.findByUserIdAndIsDefault(userId, true)
                .orElseThrow(() -> new ResourceNotFoundException("默认任务列表不存在"));
            
            // Move all tasks to default list
            for (Task task : tasksInList) {
                task.setTaskList(defaultList);
            }
            taskRepository.saveAll(tasksInList);
        }
        
        // Delete list (Requirement 14.2)
        taskListRepository.delete(taskList);
    }
    
    /**
     * Get the default task list for a user
     * 
     * @param userId the user ID
     * @return the default task list
     */
    @Transactional(readOnly = true)
    public TaskListResponse getDefaultList(Long userId) {
        TaskList defaultList = taskListRepository.findByUserIdAndIsDefault(userId, true)
            .orElseThrow(() -> new ResourceNotFoundException("默认任务列表不存在"));
        
        return mapToResponse(defaultList);
    }
    
    /**
     * Map TaskList entity to TaskListResponse DTO
     * 
     * @param taskList the task list entity
     * @return the task list response DTO
     */
    private TaskListResponse mapToResponse(TaskList taskList) {
        TaskListResponse response = new TaskListResponse();
        response.setId(taskList.getId());
        response.setName(taskList.getName());
        response.setUserId(taskList.getUser().getId());
        response.setIsDefault(taskList.getIsDefault());
        response.setTaskCount(taskList.getTasks().size());
        response.setCreatedAt(taskList.getCreatedAt());
        return response;
    }
}
