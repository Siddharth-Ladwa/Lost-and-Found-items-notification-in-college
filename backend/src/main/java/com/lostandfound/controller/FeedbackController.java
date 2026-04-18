package com.lostandfound.controller;

import com.lostandfound.entity.Feedback;
import com.lostandfound.repository.FeedbackRepository;
import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepo;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, Object> body, Authentication auth) {
        Long uid  = (Long) auth.getDetails();
        var user  = userRepo.findById(uid).orElseThrow();
        Feedback fb = Feedback.builder()
                .user(user)
                .type(Feedback.FeedbackType.valueOf(
                        body.getOrDefault("type", "FEEDBACK").toString()))
                .subject(body.getOrDefault("subject", "").toString())
                .message(body.get("message").toString())
                .rating(body.get("rating") != null
                        ? Byte.parseByte(body.get("rating").toString()) : null)
                .build();
        feedbackRepo.save(fb);
        return ResponseEntity.ok(Map.of("message", "Feedback submitted, thank you!"));
    }

    @GetMapping("/my")
    public ResponseEntity<?> myFeedback(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(feedbackRepo.findByUserIdOrderByCreatedAtDesc(uid));
    }
}
