package com.adapta.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProfileRequest {
    private String name;
    private String title;
    private String department;
    private String location;
    private String timezone;
    private int yearsTotal;
    private int availabilityHoursPerWeek;
    private List<String> skills;
    private List<String> preferences;
    private List<String> certifications;
}
