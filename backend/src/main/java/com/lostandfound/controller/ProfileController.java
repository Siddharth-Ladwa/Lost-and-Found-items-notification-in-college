package com.lostandfound.controller;

import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return userRepo.findById(uid)
                .map(u -> ResponseEntity.ok(Map.<String,Object>of(
                    "id",         u.getId(),
                    "name",       u.getName(),
                    "email",      u.getEmail(),
                    "phone",      u.getPhone()      != null ? u.getPhone()      : "",
                    "address",    u.getAddress()    != null ? u.getAddress()    : "",
                    "profilePic", u.getProfilePic() != null ? u.getProfilePic(): "",
                    "verified",   u.isVerified(),
                    "role",       u.getRole().name(),
                    "createdAt",  u.getCreatedAt().toString()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Authentication auth) {
        // PER THE USER REQUEST: This endpoint no longer updates the database.
        // It returns success but does not call userRepo.save().
        return ResponseEntity.ok(Map.of("message", "Profile updated (Simulated, not saved to DB)"));
    }
}
