package com.lostandfound.repository;

import com.lostandfound.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByUserId(Long userId, Pageable pageable);

    @Query("""
        SELECT i FROM Item i
        WHERE (:type IS NULL OR i.type = :type)
          AND (:categoryId IS NULL OR i.category.id = :categoryId)
          AND (:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:keyword IS NULL
               OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Item> search(
            @Param("type")       Item.ItemType   type,
            @Param("categoryId") Long            categoryId,
            @Param("location")   String          location,
            @Param("keyword")    String          keyword,
            Pageable pageable);

    long countByType(Item.ItemType type);
    long countByStatus(Item.ItemStatus status);


}
