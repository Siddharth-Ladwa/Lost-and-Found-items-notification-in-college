package com.lostandfound.controller;

import com.lostandfound.entity.*;
import com.lostandfound.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimRepository claimRepo;
    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final NotificationRepository notifRepo;

    // ── Submit Claim ──────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> submitClaim(@RequestBody Map<String, String> body, Authentication auth) {
        Long userId = (Long) auth.getDetails();
        Long itemId = Long.parseLong(body.get("itemId"));

        if (claimRepo.existsByItemIdAndClaimantId(itemId, userId))
            return ResponseEntity.badRequest().body(Map.of("error", "Already claimed"));

        Item item = itemRepo.findById(itemId).orElseThrow();
        User claimant = userRepo.findById(userId).orElseThrow();

        Claim claim = Claim.builder()
                .item(item)
                .claimant(claimant)
                .proofText(body.get("proofText"))
                .status(Claim.ClaimStatus.PENDING)
                .build();
        claimRepo.save(claim);

        // Notify item owner
        notifRepo.save(Notification.builder()
                .user(item.getUser())
                .title("New Claim Request")
                .message(claimant.getName() + " has claimed your item: " + item.getTitle())
                .type(Notification.NotifType.CLAIM)
                .link("/items/" + itemId)
                .build());

        return ResponseEntity.ok(Map.of("message", "Claim submitted", "id", claim.getId()));
    }

    // ── My Claims ─────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> myClaims(Authentication auth) {
        Long userId = (Long) auth.getDetails();
        return ResponseEntity.ok(claimRepo.findByClaimantId(userId));
    }

    // ── Claims on My Items ────────────────────────────────────
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> claimsOnItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(claimRepo.findByItemId(itemId));
    }

    // ── Approve / Reject (item owner action) ─────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body,
                                          Authentication auth) {
        Long userId = (Long) auth.getDetails();
        Claim claim = claimRepo.findById(id).orElseThrow();

        if (!claim.getItem().getUser().getId().equals(userId))
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));

        Claim.ClaimStatus newStatus = Claim.ClaimStatus.valueOf(body.get("status").toUpperCase());
        claim.setStatus(newStatus);
        if (newStatus == Claim.ClaimStatus.APPROVED || newStatus == Claim.ClaimStatus.REJECTED)
            claim.setResolvedAt(LocalDateTime.now());
        claimRepo.save(claim);

        // Update item status if approved
        if (newStatus == Claim.ClaimStatus.APPROVED) {
            Item item = claim.getItem();
            item.setStatus(Item.ItemStatus.CLAIMED);
            itemRepo.save(item);
        }

        // Notify claimant
        notifRepo.save(Notification.builder()
                .user(claim.getClaimant())
                .title("Claim " + newStatus.name())
                .message("Your claim for '" + claim.getItem().getTitle() + "' was " + newStatus.name().toLowerCase())
                .type(Notification.NotifType.CLAIM)
                .link("/claims/my")
                .build());

        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }
}
