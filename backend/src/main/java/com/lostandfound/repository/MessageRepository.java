package com.lostandfound.repository;

import com.lostandfound.entity.Message;
import com.lostandfound.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender.id = :uid AND m.receiver.id = :other)
           OR (m.sender.id = :other AND m.receiver.id = :uid)
        ORDER BY m.sentAt ASC
    """)
    List<Message> findConversation(@Param("uid") Long uid, @Param("other") Long other);

    @Query("""
        SELECT DISTINCT CASE
            WHEN m.sender.id = :uid THEN m.receiver
            ELSE m.sender
        END
        FROM Message m
        WHERE m.sender.id = :uid OR m.receiver.id = :uid
    """)
    List<User> findChatUsers(@Param("uid") Long uid);

    long countByReceiverIdAndIsRead(Long receiverId, boolean isRead);
}
