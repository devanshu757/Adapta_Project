package com.adapta.service;

import com.adapta.model.Project;
import com.adapta.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getProjectsForUser(String uid) {
        return projectRepository.findByOwnerIdOrderByCreatedAtDesc(uid);
    }

    public Project createProject(String uid, String name) {
        Project p = Project.builder()
                .name(name)
                .ownerId(uid)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return projectRepository.save(p);
    }

    public Project getById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }
}
