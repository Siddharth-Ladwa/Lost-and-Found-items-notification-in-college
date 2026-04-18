package com.lostandfound.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "messages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "address", "profilePic", "verified", "createdAt", "updatedAt"})
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "address", "profilePic", "verified", "createdAt", "updatedAt"})
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "category", "description", "imageUrl"})
    private Item item;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private boolean isRead = false;

    @Column(updatable = false)
    private LocalDateTime sentAt = LocalDateTime.now();
}
