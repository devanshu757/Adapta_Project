package com.adapta.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Wraps Google Gemini 1.5 Flash for two AI features:
 * 1. generateTaskDescription — fills in task context from a title + hint
 * 2. scoreTeamMatchRationale — returns a 0-100 match score + short reason
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.endpoint}")
    private String endpoint;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── Task Description ──────────────────────────────────────────────────────

    /**
     * Generates a 2-3 sentence task description using Gemini.
     * Falls back to an empty string if the API key is missing or call fails.
     */
    public String generateTaskDescription(String title, String seedPrompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            return ""; // graceful no-op when key not configured
        }

        String prompt = buildDescriptionPrompt(title, seedPrompt);
        String raw = callGemini(prompt);
        if (raw == null) return "";
        return raw.trim();
    }

    private String buildDescriptionPrompt(String title, String seedPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a software project manager. ");
        sb.append("Write a concise 2-3 sentence task description for the following task title: \"")
          .append(title).append("\". ");
        if (seedPrompt != null && !seedPrompt.isBlank()) {
            sb.append("Additional context: ").append(seedPrompt).append(". ");
        }
        sb.append("Be specific, professional, and actionable. Do NOT use markdown. Plain text only.");
        return sb.toString();
    }

    // ─── Team Formation Scoring ────────────────────────────────────────────────

    /**
     * Returns a 0-100 integer score for how well a candidate matches required skills.
     * Uses Gemini for nuanced matching (e.g. "Spring Boot" matching "Java").
     * Falls back to simple string-match if API unavailable.
     */
    public int scoreTeamMember(List<String> candidateSkills, List<String> requiredSkills,
                                 int yearsExperience, int availabilityHours, int activeTaskCount) {

        // Simple fallback scoring (always works):
        double skillScore = simpleSkillScore(candidateSkills, requiredSkills);
        double availScore = availabilityScore(availabilityHours, activeTaskCount);
        double expScore   = Math.min(yearsExperience * 10.0, 100.0);
        int fallback = (int) Math.round((skillScore * 0.60) + (availScore * 0.30) + (expScore * 0.10));

        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            return fallback;
        }

        try {
            String prompt = buildScoringPrompt(candidateSkills, requiredSkills, yearsExperience, availabilityHours, activeTaskCount);
            String raw = callGemini(prompt);
            if (raw == null) return fallback;
            // Extract first integer found in response
            String stripped = raw.replaceAll("[^0-9]", " ").trim();
            String[] parts = stripped.split("\\s+");
            if (parts.length > 0 && !parts[0].isBlank()) {
                int score = Integer.parseInt(parts[0]);
                return Math.max(0, Math.min(100, score));
            }
        } catch (Exception e) {
            log.warn("Gemini team scoring failed, using fallback: {}", e.getMessage());
        }
        return fallback;
    }

    private String buildScoringPrompt(List<String> candidateSkills, List<String> requiredSkills,
                                       int years, int hours, int activeTasks) {
        return "Score this software engineer candidate 0-100 for a team where the required skills are: "
                + String.join(", ", requiredSkills) + ". "
                + "Candidate skills: " + String.join(", ", candidateSkills) + ". "
                + "Years of experience: " + years + ". "
                + "Available hours/week: " + hours + ". "
                + "Current active tasks: " + activeTasks + ". "
                + "Consider semantic skill matches (e.g. Spring Boot counts for Java). "
                + "Reply with ONLY the integer score 0-100, nothing else.";
    }

    private double simpleSkillScore(List<String> candidate, List<String> required) {
        if (required == null || required.isEmpty()) return 100.0;
        if (candidate == null || candidate.isEmpty()) return 0.0;
        List<String> candLower = candidate.stream().map(String::toLowerCase).toList();
        long matched = required.stream()
                .filter(s -> candLower.contains(s.toLowerCase()))
                .count();
        return (double) matched / required.size() * 100.0;
    }

    private double availabilityScore(int hoursPerWeek, int activeTasks) {
        double consumed = Math.min(activeTasks * 8.0, hoursPerWeek);  // ~8h per active task
        return Math.max(0, (hoursPerWeek - consumed) / Math.max(hoursPerWeek, 1) * 100.0);
    }

    // ─── Gemini HTTP Call ──────────────────────────────────────────────────────

    private String callGemini(String prompt) {
        try {
            String url = endpoint + "?key=" + apiKey;

            Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Gemini returned status {}", response.getStatusCode());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0)
                       .path("content").path("parts").get(0)
                       .path("text").asText(null);
        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            return null;
        }
    }
}
