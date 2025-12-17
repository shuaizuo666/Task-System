package com.taskmanager.repository;

import com.taskmanager.model.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskListRepository extends JpaRepository<TaskList, Long> {
    
    /**
     * Find all task lists belonging to a specific user
     * @param userId the user ID
     * @return list of task lists
     */
    List<TaskList> findByUserId(Long userId);
    
    /**
     * Find the default task list for a specific user
     * @param userId the user ID
     * @param isDefault true to find default list
     * @return Optional containing the default task list if found
     */
    Optional<TaskList> findByUserIdAndIsDefault(Long userId, Boolean isDefault);
}
