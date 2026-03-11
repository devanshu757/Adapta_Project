package com.adapta.controller;

import com.adapta.dto.ProfileRequest;
import com.adapta.model.User;
import com.adapta.security.FirebasePrincipal;
import com.adapta.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** GET /auth/me → { hasProfile, uid, email, name } */
    @GetMapping("/auth/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal Object principalObj) {
        if (!(principalObj instanceof FirebasePrincipal p)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = authService.getOrCreateUser(p);
        return ResponseEntity.ok(Map.of(
                "uid",        user.getId(),
                "hasProfile", user.isHasProfile(),
                "email",      user.getEmail() != null ? user.getEmail() : "",
                "name",       user.getDisplayName() != null ? user.getDisplayName() : ""
        ));
    }

    /** POST /profile/complete — saves full onboarding profile */
    @PostMapping("/profile/complete")
    public ResponseEntity<?> completeProfile(
            @AuthenticationPrincipal Object principalObj,
            @RequestBody ProfileRequest req) {
        if (!(principalObj instanceof FirebasePrincipal p)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User saved = authService.completeProfile(p, req);
        return ResponseEntity.ok(Map.of(
                "success",    true,
                "hasProfile", saved.isHasProfile(),
                "uid",        saved.getId()
        ));
    }
}
