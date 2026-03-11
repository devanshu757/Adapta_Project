package com.adapta.controller;

import com.adapta.dto.TaskRequest;
import com.adapta.security.FirebasePrincipal;
import com.adapta.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * GET /tasks → all tasks for the current user, sorted by priority desc.
     * Frontend Dashboard uses this to show top priority tasks.
     */
    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal Object p) {
        if (!(p instanceof FirebasePrincipal fp)) return unauth();
        return ResponseEntity.ok(taskService.getTasksForUser(fp.getUid()));
    }

    /**
     * POST /tasks → create a task.
     * If generateDetails=true, Gemini generates the description.
     * Priority is auto-computed from impact, effort, risk, and deadline.
     */
    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal Object p,
            @RequestBody TaskRequest req) {
        if (!(p instanceof FirebasePrincipal fp)) return unauth();
        return ResponseEntity.ok(taskService.createTask(fp.getUid(), req));
    }

    /**
     * PUT /tasks/prioritize → recalculates priority for ALL tasks.
     * Called after creating a task to keep the list up to date.
     */
    @PutMapping("/prioritize")
    public ResponseEntity<?> prioritize(@AuthenticationPrincipal Object p) {
        if (!(p instanceof FirebasePrincipal)) return unauth();
        taskService.reprioritizeAll();
        return ResponseEntity.ok(Map.of("status", "reprioritized"));
    }

    private ResponseEntity<?> unauth() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
