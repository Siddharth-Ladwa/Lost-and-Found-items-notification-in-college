package com.lostandfound.controller;

import com.lostandfound.entity.User;
import com.lostandfound.repository.UserRepository;
import com.lostandfound.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    // ── Register ──────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (userRepo.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));

        User user = User.builder()
                .name(body.get("name"))
                .email(email)
                .password(body.get("password"))
                .phone(body.getOrDefault("phone", ""))
                .role(User.Role.USER)
                .build();
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    // ── Login ─────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        return userRepo.findByEmail(email)
                .filter(u -> password.equals(u.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getEmail(), u.getRole().name(), u.getId());
                    return ResponseEntity.ok(Map.of(
                        "token", token,
                        "id",    u.getId(),
                        "name",  u.getName(),
                        "email", u.getEmail(),
                        "role",  u.getRole().name()
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }
}
