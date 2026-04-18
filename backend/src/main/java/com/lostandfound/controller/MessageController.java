package com.lostandfound.controller;

import com.lostandfound.entity.Message;
import com.lostandfound.repository.MessageRepository;
import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository msgRepo;
    private final UserRepository userRepo;

    @GetMapping("/conversation/{otherId}")
    public ResponseEntity<?> conversation(@PathVariable Long otherId, Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(msgRepo.findConversation(uid, otherId));
    }

    @GetMapping("/chats")
    public ResponseEntity<?> chatUsers(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(msgRepo.findChatUsers(uid));
    }

    @PostMapping
    public ResponseEntity<?> send(@RequestBody Map<String, Object> body, Authentication auth) {
        Long senderId   = (Long) auth.getDetails();
        Long receiverId = Long.parseLong(body.get("receiverId").toString());
        var sender   = userRepo.findById(senderId).orElseThrow();
        var receiver = userRepo.findById(receiverId).orElseThrow();
        Message msg = Message.builder()
                .sender(sender).receiver(receiver)
                .content(body.get("content").toString())
                .build();
        return ResponseEntity.ok(msgRepo.save(msg));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> unreadCount(Authentication auth) {
        Long uid = (Long) auth.getDetails();
        return ResponseEntity.ok(Map.of("count", msgRepo.countByReceiverIdAndIsRead(uid, false)));
    }
}
