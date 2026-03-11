package com.adapta.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Validates Firebase JWT Bearer tokens on every request.
 * Sets a UsernamePasswordAuthenticationToken in SecurityContext
 * with principal = FirebasePrincipal (uid, email).
 */
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // Firebase not initialized (e.g. missing service account in dev)
                // Create a mock principal with uid from token claim for local dev
                chain.doFilter(request, response);
                return;
            }
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(token);
            FirebasePrincipal principal = new FirebasePrincipal(
                    decoded.getUid(),
                    decoded.getEmail(),
                    decoded.getName(),
                    decoded.getPicture()
            );
            var auth = new UsernamePasswordAuthenticationToken(
                    principal, token, List.of(new SimpleGrantedAuthority("ROLE_USER")));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception e) {
            logger.warn("Firebase token validation failed: " + e.getMessage());
        }
        chain.doFilter(request, response);
    }
}
