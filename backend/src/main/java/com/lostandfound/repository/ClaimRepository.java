package com.lostandfound.repository;

import com.lostandfound.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByClaimantId(Long userId);
    long countByStatus(Claim.ClaimStatus status);
    boolean existsByItemIdAndClaimantId(Long itemId, Long userId);
}
