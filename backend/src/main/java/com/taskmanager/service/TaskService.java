package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.ForbiddenException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.exception.ValidationException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskList;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskListRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing tasks
 */
@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskListRepository taskListRepository;
    
    /**
     * Create a new task
     * Requirements: 3.1, 3.2, 3.4, 3.5
     * 
     * @param taskRequest the task data
     * @param userId the user ID
     * @return the created task
     */
    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest, Long userId) {
        // Validate title is not empty (Requirement 3.2)
        if (taskRequest.getTitle() == null || taskRequest.getTitle().trim().isEmpty()) {
            throw new ValidationException("任务标题不能为空");
        }
        
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        
        // Get task list (use default if not specified)
        TaskList taskList;
        if (taskRequest.getListId() != null) {
            taskList = taskListRepository.findById(taskRequest.getListId())
                .orElseThrow(() -> new ResourceNotFoundException("任务列表不存在"));
            
            // Verify the list belongs to the user
            if (!taskList.getUser().getId().equals(userId)) {
                throw new ForbiddenException("无权访问该任务列表");
            }
        } else {
            // Use default list
            taskList = taskListRepository.findByUserIdAndIsDefault(userId, true)
                .orElseThrow(() -> new ResourceNotFoundException("默认任务列表不存在"));
        }
        
        // Create task
        Task task = new Task();
        task.setTitle(taskRequest.getTitle().trim());
        task.setDescription(taskRequest.getDescription());
        
        // Set default status to TODO if not specified (Requirement 3.4)
        task.setStatus(taskRequest.getStatus() != null ? taskRequest.getStatus() : TaskStatus.TODO);
        
        // Set default priority to MEDIUM if not specified
        task.setPriority(taskRequest.getPriority() != null ? taskRequest.getPriority() : TaskPriority.MEDIUM);
        
        task.setDueDate(taskRequest.getDueDate());
        task.setUser(user);
        task.setTaskList(taskList);
        
        // Save task (createdAt and userId are automatically set - Requirement 3.5)
        Task savedTask = taskRepository.save(task);
        
        return mapToResponse(savedTask);
    }
    
    /**
     * Get a task by ID
     * Requirements: 5.1, 6.4
     * 
     * @param taskId the task ID
     * @param userId the user ID
     * @return the task
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("任务不存在"));
        
        // Verify ownership (Requirement 6.4)
        if (!task.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权访问该任务");
        }
        
        return mapToResponse(task);
    }
    
    /**
     * Get all tasks for a user with pagination and sorting
     * Requirements: 5.1, 5.3, 5.5
     * 
     * @param userId the user ID
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of tasks
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(Long userId, int page, int size) {
        // Sort by createdAt descending (newest first - Requirement 5.5)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Get tasks for user only (user isolation - Requirement 5.3)
        Page<Task> tasks = taskRepository.findByUserId(userId, pageable);
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Get tasks with optional filters (status, priority, search)
     * Requirements: 8.1, 9.1, 10.1, 10.2, 10.4
     * 
     * @param userId the user ID
     * @param status optional status filter
     * @param priority optional priority filter
     * @param search optional search term
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of filtered tasks
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksWithFilters(Long userId, TaskStatus status, 
                                                   TaskPriority priority, String search,
                                                   int page, int size) {
        // Sort by createdAt descending to maintain sort order (Requirements 8.4, 9.4)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<Task> tasks;
        
        // Apply search if provided (Requirements 10.1, 10.2, 10.4)
        if (search != null && !search.trim().isEmpty()) {
            tasks = taskRepository.searchByTitleOrDescription(userId, search.trim(), pageable);
        }
        // Apply status filter if provided (Requirement 8.1)
        else if (status != null) {
            tasks = taskRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        // Apply priority filter if provided (Requirement 9.1)
        else if (priority != null) {
            tasks = taskRepository.findByUserIdAndPriority(userId, priority, pageable);
        }
        // No filters - return all tasks
        else {
            tasks = taskRepository.findByUserId(userId, pageable);
        }
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Filter tasks by status
     * Requirements: 8.1, 8.4
     * 
     * @param userId the user ID
     * @param status the task status
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of tasks with the specified status
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByStatus(Long userId, TaskStatus status, int page, int size) {
        // Sort by createdAt descending to maintain sort order (Requirement 8.4)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Filter by status (Requirement 8.1)
        Page<Task> tasks = taskRepository.findByUserIdAndStatus(userId, status, pageable);
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Filter tasks by priority
     * Requirements: 9.1, 9.4
     * 
     * @param userId the user ID
     * @param priority the task priority
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of tasks with the specified priority
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByPriority(Long userId, TaskPriority priority, int page, int size) {
        // Sort by createdAt descending to maintain sort order (Requirement 9.4)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Filter by priority (Requirement 9.1)
        Page<Task> tasks = taskRepository.findByUserIdAndPriority(userId, priority, pageable);
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Search tasks by title or description
     * Requirements: 10.1, 10.2, 10.4
     * 
     * @param userId the user ID
     * @param searchTerm the search term
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of tasks matching the search term
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> searchTasks(Long userId, String searchTerm, int page, int size) {
        // Sort by createdAt descending to maintain sort order
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Search in title and description (case-insensitive, partial match)
        // Requirements: 10.1, 10.2, 10.4
        Page<Task> tasks = taskRepository.searchByTitleOrDescription(userId, searchTerm, pageable);
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Update a task
     * Requirements: 6.1, 6.2, 6.4, 6.5
     * 
     * @param taskId the task ID
     * @param taskRequest the updated task data
     * @param userId the user ID
     * @return the updated task
     */
    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest taskRequest, Long userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("任务不存在"));
        
        // Verify ownership (Requirement 6.4)
        if (!task.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权编辑该任务");
        }
        
        // Validate title if provided
        if (taskRequest.getTitle() != null) {
            if (taskRequest.getTitle().trim().isEmpty()) {
                throw new ValidationException("任务标题不能为空");
            }
            task.setTitle(taskRequest.getTitle().trim());
        }
        
        // Update fields (Requirement 6.2)
        if (taskRequest.getDescription() != null) {
            task.setDescription(taskRequest.getDescription());
        }
        
        if (taskRequest.getStatus() != null) {
            task.setStatus(taskRequest.getStatus());
        }
        
        if (taskRequest.getPriority() != null) {
            task.setPriority(taskRequest.getPriority());
        }
        
        if (taskRequest.getDueDate() != null) {
            task.setDueDate(taskRequest.getDueDate());
        }
        
        // Update list if specified
        if (taskRequest.getListId() != null) {
            TaskList newList = taskListRepository.findById(taskRequest.getListId())
                .orElseThrow(() -> new ResourceNotFoundException("任务列表不存在"));
            
            // Verify the list belongs to the user
            if (!newList.getUser().getId().equals(userId)) {
                throw new ForbiddenException("无权访问该任务列表");
            }
            
            task.setTaskList(newList);
        }
        
        // Save task (updatedAt is automatically updated - Requirement 6.5)
        Task updatedTask = taskRepository.save(task);
        
        return mapToResponse(updatedTask);
    }
    
    /**
     * Get tasks by list ID
     * Requirements: 13.1
     * 
     * @param userId the user ID
     * @param listId the list ID
     * @param page the page number (0-indexed)
     * @param size the page size
     * @return page of tasks in the specified list
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByListId(Long userId, Long listId, int page, int size) {
        // Sort by createdAt descending to maintain sort order
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // Filter by list ID (Requirement 13.1)
        Page<Task> tasks = taskRepository.findByUserIdAndTaskListId(userId, listId, pageable);
        
        return tasks.map(this::mapToResponse);
    }
    
    /**
     * Delete a task
     * Requirements: 7.1, 7.3
     * 
     * @param taskId the task ID
     * @param userId the user ID
     */
    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("任务不存在"));
        
        // Verify ownership (Requirement 7.3)
        if (!task.getUser().getId().equals(userId)) {
            throw new ForbiddenException("无权删除该任务");
        }
        
        // Delete task (Requirement 7.1)
        taskRepository.delete(task);
    }
    
    /**
     * Map Task entity to TaskResponse DTO
     * 
     * @param task the task entity
     * @return the task response DTO
     */
    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setDueDate(task.getDueDate());
        response.setUserId(task.getUser().getId());
        response.setListId(task.getTaskList().getId());
        response.setListName(task.getTaskList().getName());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}
