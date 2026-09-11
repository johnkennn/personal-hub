package com.zzh.personal_hub.deal.repository;

import com.zzh.personal_hub.deal.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findByDeletedAtIsNullAndStatusAndStartsAtLessThanEqualAndEndsAtGreaterThanEqualOrderByEndsAtAsc(
            String status, Instant nowForStart, Instant nowForEnd);

    List<Deal> findByDeletedAtIsNullOrderByUpdatedAtDesc();
}
