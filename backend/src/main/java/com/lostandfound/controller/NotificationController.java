package com.lostandfound.controller;

import com.lostandfound.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notifRepo;

    @GetMapping
    public ResponseEntity<?> getAll(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(notifRepo.findByUserIdOrderByCreatedAtDesc(uid));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> unreadCount(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(Map.of("count", notifRepo.countByUserIdAndIsRead(uid, false)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        notifRepo.findById(id).ifPresent(n -> { n.setRead(true); notifRepo.save(n); });
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        notifRepo.findByUserIdOrderByCreatedAtDesc(uid).forEach(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
