package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskPriority;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    /**
     * Find all tasks belonging to a specific user with pagination
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of tasks
     */
    Page<Task> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find all tasks belonging to a specific user
     * @param userId the user ID
     * @return list of tasks
     */
    List<Task> findByUserId(Long userId);
    
    /**
     * Find tasks by user ID and task list ID
     * @param userId the user ID
     * @param listId the task list ID
     * @param pageable pagination information
     * @return page of tasks
     */
    Page<Task> findByUserIdAndTaskListId(Long userId, Long listId, Pageable pageable);
    
    /**
     * Find all tasks in a specific task list
     * @param listId the task list ID
     * @return list of tasks
     */
    List<Task> findByTaskListId(Long listId);
    
    /**
     * Find tasks by user ID and status
     * @param userId the user ID
     * @param status the task status
     * @param pageable pagination information
     * @return page of tasks
     */
    Page<Task> findByUserIdAndStatus(Long userId, TaskStatus status, Pageable pageable);
    
    /**
     * Find tasks by user ID and priority
     * @param userId the user ID
     * @param priority the task priority
     * @param pageable pagination information
     * @return page of tasks
     */
    Page<Task> findByUserIdAndPriority(Long userId, TaskPriority priority, Pageable pageable);
    
    /**
     * Search tasks by title or description (case-insensitive)
     * @param userId the user ID
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return page of tasks matching the search
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Task> searchByTitleOrDescription(@Param("userId") Long userId, 
                                          @Param("searchTerm") String searchTerm, 
                                          Pageable pageable);
    
    /**
     * Count tasks by user ID and status
     * @param userId the user ID
     * @param status the task status
     * @return count of tasks
     */
    long countByUserIdAndStatus(Long userId, TaskStatus status);
    
    /**
     * Count tasks by user ID
     * @param userId the user ID
     * @return count of tasks
     */
    long countByUserId(Long userId);
    
    /**
     * Find tasks due on a specific date for a user
     * @param userId the user ID
     * @param dueDate the due date
     * @return list of tasks
     */
    List<Task> findByUserIdAndDueDate(Long userId, LocalDate dueDate);
    
    /**
     * Find overdue tasks for a user (due date before today and not completed)
     * @param userId the user ID
     * @param today today's date
     * @param status the status to exclude (COMPLETED)
     * @return list of overdue tasks
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "t.dueDate < :today AND t.status != :status")
    List<Task> findOverdueTasks(@Param("userId") Long userId, 
                                @Param("today") LocalDate today, 
                                @Param("status") TaskStatus status);
}
