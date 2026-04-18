package com.lostandfound.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "claims")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Claim {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "category", "description", "imageUrl", "createdAt", "updatedAt"})
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "address", "profilePic", "verified", "createdAt", "updatedAt"})
    private User claimant;

    @Column(columnDefinition = "TEXT")
    private String proofText;

    private String proofImage;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Column(updatable = false)
    private LocalDateTime claimedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    public enum ClaimStatus { PENDING, APPROVED, REJECTED, HANDED_OVER }
}
