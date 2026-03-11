package com.adapta.repository;

import com.adapta.model.Task;
import com.adapta.model.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectIdOrderByPriorityDesc(String projectId);
    List<Task> findByCreatedByUidOrderByPriorityDesc(String uid);
    List<Task> findByProjectIdAndStatusOrderByPriorityDesc(String projectId, TaskStatus status);
    long countByProjectIdAndStatus(String projectId, TaskStatus status);
    long countByStatus(TaskStatus status);
    List<Task> findByAssignedToUid(String uid);
}
