package com.lostandfound.controller;

import com.lostandfound.entity.*;
import com.lostandfound.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository         userRepo;
    private final ItemRepository         itemRepo;
    private final ClaimRepository        claimRepo;
    private final FeedbackRepository     feedbackRepo;
    private final AnnouncementRepository announcementRepo;
    private final EventRepository        eventRepo;
    private final NotificationRepository notificationRepo;

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<?> broadcastNotification(@RequestBody Map<String, String> body) {
        String title   = body.get("title");
        String message = body.get("message");
        String type    = body.getOrDefault("type", "SYSTEM");

        userRepo.findAll().forEach(user -> {
            Notification n = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(Notification.NotifType.valueOf(type.toUpperCase()))
                    .isRead(false)
                    .build();
            notificationRepo.save(n);
        });
        return ResponseEntity.ok(Map.of("message", "Broadcast sent"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(Map.of(
            "totalUsers",   userRepo.count(),
            "totalItems",   itemRepo.count(),
            "totalLost",    itemRepo.countByType(Item.ItemType.LOST),
            "totalFound",   itemRepo.countByType(Item.ItemType.FOUND),
            "activeClaims", claimRepo.countByStatus(Claim.ClaimStatus.PENDING),
            "resolved",     claimRepo.countByStatus(Claim.ClaimStatus.HANDED_OVER)
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> allUsers() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @GetMapping("/items")
    public ResponseEntity<?> allItems() {
        return ResponseEntity.ok(itemRepo.findAll(Sort.by("createdAt").descending()));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        itemRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted"));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return itemRepo.findById(id).map(item -> {
            if (body.containsKey("title"))       item.setTitle(body.get("title"));
            if (body.containsKey("description")) item.setDescription(body.get("description"));
            if (body.containsKey("location"))    item.setLocation(body.get("location"));
            if (body.containsKey("status"))      item.setStatus(Item.ItemStatus.valueOf(body.get("status")));
            if (body.containsKey("type"))        item.setType(Item.ItemType.valueOf(body.get("type")));
            itemRepo.save(item);
            return ResponseEntity.ok(Map.of("message", "Item updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> postAnnouncement(@RequestBody Map<String, String> body) {
        Announcement ann = Announcement.builder()
                .title(body.get("title"))
                .content(body.get("content"))
                .type(Announcement.AnnouncementType.valueOf(
                        body.getOrDefault("type", "NOTICE")))
                .isActive(true)
                .build();
        announcementRepo.save(ann);
        return ResponseEntity.ok(Map.of("message", "Announcement posted"));
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, String> body) {
        Event ev = Event.builder()
                .title(body.get("title"))
                .description(body.get("description"))
                .location(body.get("location"))
                .eventDate(body.get("eventDate") != null
                        ? LocalDateTime.parse(body.get("eventDate")) : null)
                .build();
        eventRepo.save(ev);
        return ResponseEntity.ok(Map.of("message", "Event created"));
    }

    @GetMapping("/feedback")
    public ResponseEntity<?> allFeedback() {
        return ResponseEntity.ok(feedbackRepo.findAll());
    }

    @DeleteMapping("/feedback/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        feedbackRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Feedback deleted"));
    }
}
