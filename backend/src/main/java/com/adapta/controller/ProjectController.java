package com.adapta.controller;

import com.adapta.model.Project;
import com.adapta.model.Task;
import com.adapta.security.FirebasePrincipal;
import com.adapta.service.ProjectService;
import com.adapta.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final TaskService taskService;

    public ProjectController(ProjectService projectService, TaskService taskService) {
        this.projectService = projectService;
        this.taskService = taskService;
    }

    /** GET /projects → list all projects for the authenticated user */
    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal Object p) {
        if (!(p instanceof FirebasePrincipal fp)) return unauth();
        return ResponseEntity.ok(projectService.getProjectsForUser(fp.getUid()));
    }

    /** POST /projects { name } → create and return new project */
    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal Object p,
            @RequestBody Map<String, String> body) {
        if (!(p instanceof FirebasePrincipal fp)) return unauth();
        String name = body.getOrDefault("name", "Untitled Project");
        return ResponseEntity.ok(projectService.createProject(fp.getUid(), name));
    }

    /** GET /projects/{id}/tasks → tasks for a specific project, sorted by priority */
    @GetMapping("/{id}/tasks")
    public ResponseEntity<?> projectTasks(
            @AuthenticationPrincipal Object p,
            @PathVariable String id) {
        if (!(p instanceof FirebasePrincipal)) return unauth();
        List<Task> tasks = taskService.getTasksForProject(id);
        return ResponseEntity.ok(tasks);
    }

    private ResponseEntity<?> unauth() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
