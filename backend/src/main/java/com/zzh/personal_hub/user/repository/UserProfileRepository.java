package com.zzh.personal_hub.user.repository;

import com.zzh.personal_hub.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}