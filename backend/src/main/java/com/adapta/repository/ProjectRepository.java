package com.adapta.repository;

import com.adapta.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
}
