package com.adapta.service;

import com.adapta.dto.ProfileRequest;
import com.adapta.model.User;
import com.adapta.repository.UserRepository;
import com.adapta.security.FirebasePrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Gets or creates a User document from a Firebase principal.
     * Returns { hasProfile } for the /auth/me endpoint.
     */
    public User getOrCreateUser(FirebasePrincipal principal) {
        return userRepository.findById(principal.getUid()).orElseGet(() -> {
            User u = User.builder()
                    .id(principal.getUid())
                    .email(principal.getEmail())
                    .displayName(principal.getName())
                    .photoURL(principal.getPhotoURL())
                    .hasProfile(false)
                    .activeTaskCount(0)
                    .currentWorkloadScore(0)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userRepository.save(u);
        });
    }

    /**
     * Saves full profile data and marks hasProfile = true.
     */
    public User completeProfile(FirebasePrincipal principal, ProfileRequest req) {
        User user = getOrCreateUser(principal);
        user.setName(req.getName());
        user.setTitle(req.getTitle());
        user.setDepartment(req.getDepartment());
        user.setLocation(req.getLocation());
        user.setTimezone(req.getTimezone());
        user.setYearsTotal(req.getYearsTotal());
        user.setAvailabilityHoursPerWeek(
                req.getAvailabilityHoursPerWeek() > 0 ? req.getAvailabilityHoursPerWeek() : 40);
        user.setSkills(req.getSkills());
        user.setPreferences(req.getPreferences());
        user.setCertifications(req.getCertifications());
        user.setHasProfile(true);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
