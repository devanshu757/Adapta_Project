package com.adapta.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Task with AI-computed priority and urgency scores.
 *
 * Priority formula:
 *   priority = clamp( (impact×8) + (risk×4) − (effort×2) + urgencyBonus, 0, 100 )
 *
 * urgencyBonus (deadline-driven):
 *   ≤ 3 days  → +30
 *   ≤ 7 days  → +20
 *   ≤ 14 days → +10
 *   no deadline → 0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    @Indexed
    private String projectId;

    private String createdByUid;        // Firebase UID of creator
    private String assignedToUid;       // Firebase UID of assignee (team formation)

    // ─── Content ──────────────────────────────────────────────
    private String title;
    private String description;         // May be AI-generated

    // ─── Scoring inputs (1–10 each) ──────────────────────────
    private int impact;                 // Business impact
    private int effort;                 // Engineering effort
    private int risk;                   // Risk if delayed

    // ─── Deadline & estimation ───────────────────────────────
    private LocalDate deadline;
    private Integer estimatedHours;

    // ─── Computed priority (0–100) ───────────────────────────
    private double priority;
    private double urgencyBonus;        // Portion contributed by deadline

    // ─── Status ───────────────────────────────────────────────
    private TaskStatus status;

    // ─── AI generation flags ──────────────────────────────────
    private boolean generateDetails;
    private String seedPrompt;
    private boolean aiGenerated;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
