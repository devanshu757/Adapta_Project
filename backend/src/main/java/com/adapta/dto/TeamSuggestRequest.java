package com.adapta.dto;

import lombok.Data;
import java.util.Map;

@Data
public class TeamSuggestRequest {
    private Map<String, Integer> requiredSkills;   // skill → weight (1 = required)
    private int sizeLimit;                          // max team size
}
