package com.zzh.personal_hub.suggestion.repository;

import com.zzh.personal_hub.suggestion.entity.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    List<Suggestion> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Suggestion> findAllByOrderByCreatedAtDesc();
}
