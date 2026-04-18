package com.lostandfound.repository;

import com.lostandfound.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByEventDateAfterOrderByEventDateAsc(LocalDateTime now);
    List<Event> findByEventDateBeforeOrderByEventDateDesc(LocalDateTime now);
}
