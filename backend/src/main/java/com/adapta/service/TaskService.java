package com.adapta.service;

import com.adapta.dto.TaskRequest;
import com.adapta.model.Task;
import com.adapta.model.TaskStatus;
import com.adapta.repository.TaskRepository;
import com.adapta.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Core service handling task creation, priority scoring, and AI urgency.
 *
 * Priority formula:
 *   priority = clamp( (impact×8) + (risk×4) − (effort×2) + urgencyBonus , 0, 100 )
 *
 * urgencyBonus (deadline-driven):
 *   ≤ 3  days  → +30
 *   ≤ 7  days  → +20
 *   ≤ 14 days  → +10
 *   no deadline → 0
 *
 * workloadBonus (project activity):
 *   each in-progress task in same project adds +2 (capped at +10)
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository,
                       AIService aiService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    // ─── Read ──────────────────────────────────────────────────────────────────

    public List<Task> getTasksForProject(String projectId) {
        return taskRepository.findByProjectIdOrderByPriorityDesc(projectId);
    }

    public List<Task> getTasksForUser(String uid) {
        return taskRepository.findByCreatedByUidOrderByPriorityDesc(uid);
    }

    // ─── Create ────────────────────────────────────────────────────────────────

    public Task createTask(String uid, TaskRequest req) {
        // Clamp inputs to 1-10 range
        int impact = clamp(req.getImpact(), 1, 10);
        int effort = clamp(req.getEffort(), 1, 10);
        int risk   = clamp(req.getRisk(),   1, 10);

        double urgency = computeUrgencyBonus(req.getDeadline(), req.getProjectId());
        double priority = computePriority(impact, effort, risk, urgency);

        // Optionally AI-generate description
        String description = "";
        boolean aiGenerated = false;
        if (req.isGenerateDetails()) {
            description = aiService.generateTaskDescription(req.getTitle(), req.getSeedPrompt());
            aiGenerated = !description.isBlank();
        }

        Task task = Task.builder()
                .projectId(req.getProjectId())
                .createdByUid(uid)
                .title(req.getTitle())
                .description(description)
                .impact(impact)
                .effort(effort)
                .risk(risk)
                .deadline(req.getDeadline())
                .estimatedHours(req.getEstimatedHours())
                .priority(priority)
                .urgencyBonus(urgency)
                .status(TaskStatus.TODO)
                .generateDetails(req.isGenerateDetails())
                .seedPrompt(req.getSeedPrompt())
                .aiGenerated(aiGenerated)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        task = taskRepository.save(task);
        updateAssigneeWorkload(uid);
        return task;
    }

    // ─── Prioritize all (re-score) ─────────────────────────────────────────────

    public void reprioritizeAll() {
        List<Task> all = taskRepository.findAll();
        for (Task t : all) {
            double urgency  = computeUrgencyBonus(t.getDeadline(), t.getProjectId());
            double priority = computePriority(t.getImpact(), t.getEffort(), t.getRisk(), urgency);
            t.setPriority(priority);
            t.setUrgencyBonus(urgency);
            t.setUpdatedAt(LocalDateTime.now());
        }
        taskRepository.saveAll(all);
    }

    // ─── Priority math ─────────────────────────────────────────────────────────

    /**
     * Core priority formula — returns 0–100.
     */
    public static double computePriority(int impact, int effort, int risk, double urgencyBonus) {
        double raw = (impact * 8.0) + (risk * 4.0) - (effort * 2.0) + urgencyBonus;
        return Math.max(0, Math.min(100, raw));
    }

    /**
     * Deadline-driven urgency bonus with workload factor.
     *
     * Deadline proximity:  ≤3d→+30, ≤7d→+20, ≤14d→+10, else→0
     * Workload factor:     each in-progress task in same project adds +2 (max +10)
     */
    double computeUrgencyBonus(LocalDate deadline, String projectId) {
        double bonus = 0;

        if (deadline != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), deadline);
            if (days <= 0)       bonus = 30;  // overdue → maximum urgency
            else if (days <= 3)  bonus = 30;
            else if (days <= 7)  bonus = 20;
            else if (days <= 14) bonus = 10;
        }

        // Workload factor from project busyness
        if (projectId != null) {
            long inProgress = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
            bonus += Math.min(inProgress * 2.0, 10.0);
        }

        return bonus;
    }

    // ─── Workload tracking (for team formation) ────────────────────────────────

    private void updateAssigneeWorkload(String uid) {
        userRepository.findById(uid).ifPresent(user -> {
            List<Task> activeTasks = taskRepository.findByAssignedToUid(uid).stream()
                    .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
                    .toList();
            int activeCount = activeTasks.size();
            // Workload score: 100 = fully loaded (8h task per hour of availability)
            double workload = user.getAvailabilityHoursPerWeek() > 0
                    ? Math.min(activeCount * 8.0 / user.getAvailabilityHoursPerWeek() * 100, 100)
                    : 0;
            user.setActiveTaskCount(activeCount);
            user.setCurrentWorkloadScore(workload);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }
}
