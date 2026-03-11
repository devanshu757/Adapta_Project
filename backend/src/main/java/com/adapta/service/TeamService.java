package com.adapta.service;

import com.adapta.dto.TeamSuggestRequest;
import com.adapta.model.User;
import com.adapta.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Ranks team candidates for a given set of required skills.
 *
 * Score formula (0–100):
 *   score = (skillMatch × 0.60) + (availScore × 0.30) + (expScore × 0.10)
 *
 * skillMatch  = % of required skills found in candidate's skill list (AI-enhanced via Gemini)
 * availScore  = % of availability remaining after existing workload
 * expScore    = min(yearsTotal × 10, 100)
 */
@Service
public class TeamService {

    private final UserRepository userRepository;
    private final AIService aiService;

    public TeamService(UserRepository userRepository, AIService aiService) {
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    public List<Map<String, Object>> suggestTeam(TeamSuggestRequest req) {
        List<String> required = req.getRequiredSkills() == null
                ? List.of()
                : new ArrayList<>(req.getRequiredSkills().keySet());

        int limit = req.getSizeLimit() > 0 ? req.getSizeLimit() : 3;

        // Score all users who have profiles
        List<User> users = userRepository.findAll().stream()
                .filter(User::isHasProfile)
                .toList();

        return users.stream()
                .map(u -> scoreUser(u, required))
                .sorted(Comparator.comparingDouble(m -> -((Number) m.get("score")).doubleValue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private Map<String, Object> scoreUser(User u, List<String> required) {
        List<String> skills = u.getSkills() == null ? List.of() : u.getSkills();

        int aiScore = aiService.scoreTeamMember(
                skills,
                required,
                u.getYearsTotal(),
                u.getAvailabilityHoursPerWeek(),
                u.getActiveTaskCount()
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id",            u.getId());
        result.put("name",          u.getName() != null ? u.getName() : u.getDisplayName());
        result.put("email",         u.getEmail());
        result.put("photoURL",      u.getPhotoURL());
        result.put("title",         u.getTitle());
        result.put("department",    u.getDepartment());
        result.put("skills",        skills);
        result.put("certifications",u.getCertifications());
        result.put("yearsTotal",    u.getYearsTotal());
        result.put("availabilityHoursPerWeek", u.getAvailabilityHoursPerWeek());
        result.put("activeTaskCount",          u.getActiveTaskCount());
        result.put("currentWorkloadScore",     u.getCurrentWorkloadScore());
        result.put("score",         aiScore);
        result.put("score_label",   aiScore + "%");
        return result;
    }
}
