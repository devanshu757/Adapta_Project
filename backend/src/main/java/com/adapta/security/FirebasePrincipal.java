package com.adapta.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FirebasePrincipal {
    private final String uid;
    private final String email;
    private final String name;
    private final String photoURL;
}
