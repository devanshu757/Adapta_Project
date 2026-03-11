package com.adapta.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    private String projectId;
    private String title;
    private int impact;              // 1–10
    private int effort;              // 1–10
    private int risk;                // 1–10
    private LocalDate deadline;
    private Integer estimatedHours;
    private boolean generateDetails; // AI flag
    private String seedPrompt;
}
