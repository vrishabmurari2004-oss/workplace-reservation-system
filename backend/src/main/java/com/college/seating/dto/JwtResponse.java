package com.college.seating.dto;

public class JwtResponse {
    private final String token;
    private final String type = "Bearer";
    private final String username;
    private final String role;

    public JwtResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
