package com.lostandfound.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "announcements")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Announcement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private AnnouncementType type = AnnouncementType.NOTICE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "address", "profilePic", "verified", "createdAt", "updatedAt"})
    private User author;

    private boolean isActive = true;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AnnouncementType { UPDATE, NOTICE, MAINTENANCE, GOVERNMENT }
}
