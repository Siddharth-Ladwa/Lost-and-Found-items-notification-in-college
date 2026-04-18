package com.lostandfound.controller;

import com.lostandfound.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepo;

    @GetMapping("/upcoming")
    public ResponseEntity<?> upcoming() {
        return ResponseEntity.ok(eventRepo.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now()));
    }

    @GetMapping("/past")
    public ResponseEntity<?> past() {
        return ResponseEntity.ok(eventRepo.findByEventDateBeforeOrderByEventDateDesc(LocalDateTime.now()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        return eventRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
