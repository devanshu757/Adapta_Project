package com.adapta.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a user. Firebase UID is the @Id.
 * The embedded profile is used for team formation scoring.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;                      // Firebase UID

    // Firebase identity
    @Indexed(unique = true)
    private String email;
    private String displayName;
    private String photoURL;

    private boolean hasProfile;

    // ─── Personal Info ───────────────────────────────────────
    private String name;
    private String title;                   // e.g. "Senior Engineer"
    private String department;
    private String location;
    private String timezone;

    // ─── Experience ──────────────────────────────────────────
    private int yearsTotal;                 // Total years of experience
    private List<String> skills;            // e.g. ["React", "Java", "MongoDB"]
    private List<String> certifications;    // e.g. ["AWS", "PMP"]

    // ─── Availability ─────────────────────────────────────────
    private int availabilityHoursPerWeek;   // e.g. 40
    private List<String> preferences;       // e.g. ["remote", "async"]

    // ─── Computed Workload (updated by TaskService) ───────────
    private int activeTaskCount;            // # of in-progress tasks
    private double currentWorkloadScore;    // 0–100; higher = more loaded

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
