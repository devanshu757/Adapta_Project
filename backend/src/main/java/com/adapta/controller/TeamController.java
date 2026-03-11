package com.adapta.controller;

import com.adapta.dto.TeamSuggestRequest;
import com.adapta.security.FirebasePrincipal;
import com.adapta.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    /**
     * POST /teams/suggest
     * Body: { "requiredSkills": { "React": 1, "Java": 1 }, "sizeLimit": 3 }
     * Returns: ranked list of user profiles with score (0-100)
     */
    @PostMapping("/suggest")
    public ResponseEntity<?> suggest(
            @AuthenticationPrincipal Object p,
            @RequestBody TeamSuggestRequest req) {
        if (!(p instanceof FirebasePrincipal)) return unauth();
        return ResponseEntity.ok(teamService.suggestTeam(req));
    }

    private ResponseEntity<?> unauth() {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
