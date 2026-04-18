package com.lostandfound.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "feedback")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "address", "profilePic", "verified", "createdAt", "updatedAt"})
    private User user;

    @Enumerated(EnumType.STRING)
    private FeedbackType type = FeedbackType.FEEDBACK;

    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private Byte rating;

    @Enumerated(EnumType.STRING)
    private FeedbackStatus status = FeedbackStatus.NEW;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum FeedbackType   { FEEDBACK, SUGGESTION, BUG, COMPLAINT }
    public enum FeedbackStatus { NEW, REVIEWED, RESOLVED }
}
