package com.adapta.controller;

import com.adapta.security.FirebasePrincipal;
import com.adapta.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /analytics/kpis
     * Returns: { total_tasks, done, in_progress, todo, blocked, completion_pct }
     */
    @GetMapping("/kpis")
    public ResponseEntity<?> kpis(@AuthenticationPrincipal Object p) {
        if (!(p instanceof FirebasePrincipal)) return unauth();
        return ResponseEntity.ok(analyticsService.getKpis());
    }

    private ResponseEntity<?> unauth() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
