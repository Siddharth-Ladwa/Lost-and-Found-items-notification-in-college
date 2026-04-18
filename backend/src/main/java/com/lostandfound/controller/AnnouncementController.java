package com.lostandfound.controller;

import com.lostandfound.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepo;

    @GetMapping
    public ResponseEntity<?> getActive() {
        return ResponseEntity.ok(announcementRepo.findByIsActiveTrueOrderByCreatedAtDesc());
    }
}
