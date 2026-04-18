package com.lostandfound.controller;

import com.lostandfound.entity.*;
import com.lostandfound.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final NotificationRepository notifRepo;

    // ── All Items (paginated, filtered) ──────────────────────
    @GetMapping
    public ResponseEntity<?> getItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Item.ItemType itemType = (type != null) ? Item.ItemType.valueOf(type.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Item> result = itemRepo.search(itemType, categoryId, location, keyword, pageable);
        return ResponseEntity.ok(result);
    }

    // ── Get Single Item ───────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable Long id) {
        return itemRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── My Items ──────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> myItems(Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(auth);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(itemRepo.findByUserId(userId, pageable));
    }

    // ── Report Item (Lost or Found) ───────────────────────────
    @PostMapping
    public ResponseEntity<?> reportItem(
            Authentication auth,
            @RequestParam String type,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String dateLostFound,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) MultipartFile image) {

        Long userId = getUserId(auth);
        User user = userRepo.findById(userId).orElseThrow();

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        Item item = Item.builder()
                .user(user)
                .type(Item.ItemType.valueOf(type.toUpperCase()))
                .title(title)
                .description(description != null && !description.isBlank() ? description : null)
                .location(location != null && !location.isBlank() ? location : null)
                .color(color != null && !color.isBlank() ? color : null)
                .brand(brand != null && !brand.isBlank() ? brand : null)
                .imageUrl(imageUrl)
                .dateLostFound(dateLostFound != null && !dateLostFound.isBlank() ? LocalDate.parse(dateLostFound) : null)
                .status(Item.ItemStatus.OPEN)
                .build();

        if (categoryId != null) {
            categoryRepo.findById(categoryId).ifPresent(item::setCategory);
        }

        itemRepo.save(item);
        return ResponseEntity.ok(Map.of("message", "Item reported successfully", "id", item.getId()));
    }

    // ── Update Item ───────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        Authentication auth) {
        Long userId = getUserId(auth);
        return itemRepo.findById(id).map(item -> {
            if (!item.getUser().getId().equals(userId))
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            if (body.containsKey("title"))       item.setTitle(body.get("title"));
            if (body.containsKey("description")) item.setDescription(body.get("description"));
            if (body.containsKey("location"))    item.setLocation(body.get("location"));
            if (body.containsKey("status"))      item.setStatus(Item.ItemStatus.valueOf(body.get("status")));
            itemRepo.save(item);
            return ResponseEntity.ok(Map.of("message", "Updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Delete Item ───────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, Authentication auth) {
        Long userId = getUserId(auth);
        return itemRepo.findById(id).map(item -> {
            if (!item.getUser().getId().equals(userId))
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
            itemRepo.delete(item);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Stats ─────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(Map.of(
            "totalLost",    itemRepo.countByType(Item.ItemType.LOST),
            "totalFound",   itemRepo.countByType(Item.ItemType.FOUND),
            "activeClaims", itemRepo.countByStatus(Item.ItemStatus.CLAIMED),
            "matched",      itemRepo.countByStatus(Item.ItemStatus.MATCHED)
        ));
    }

    // ── Categories ────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<?> categories() {
        return ResponseEntity.ok(categoryRepo.findAllByOrderByNameAsc());
    }

    // ── Helpers ───────────────────────────────────────────────
    private Long getUserId(Authentication auth) {
        return (Long) auth.getDetails();
    }

    private String saveImage(MultipartFile file) {
        try {
            String baseDir = System.getProperty("user.dir");
            String uploadDir = baseDir + File.separator + "uploads" + File.separator + "items" + File.separator;
            
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + filename);
            
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            System.out.println("Image saved to: " + filePath.toAbsolutePath());
            return "/uploads/items/" + filename;
        } catch (Exception e) {
            System.err.println("Failed to save image: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
