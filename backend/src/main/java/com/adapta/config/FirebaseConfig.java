package com.adapta.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-path}")
    private String serviceAccountPath;

    @PostConstruct
    public void initFirebase() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) return;

        InputStream stream;
        try {
            stream = new FileInputStream(serviceAccountPath);
        } catch (Exception e) {
            // Fallback: try classpath (useful for tests / CI)
            stream = getClass().getClassLoader().getResourceAsStream(serviceAccountPath);
            if (stream == null) {
                System.err.println("[Adapta] WARNING: Firebase service account not found at: "
                        + serviceAccountPath + " — auth will be disabled.");
                return;
            }
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(stream))
                .build();
        FirebaseApp.initializeApp(options);
        System.out.println("[Adapta] Firebase initialized OK");
    }
}
