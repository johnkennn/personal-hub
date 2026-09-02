package com.zzh.personal_hub.user.repository;

import com.zzh.personal_hub.user.entity.User;
import com.zzh.personal_hub.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByRole(UserRole role);

    List<User> findAllByOrderByCreatedAtDesc();
}