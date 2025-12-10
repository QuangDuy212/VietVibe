package com.example.VietVibe.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.User;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String>, JpaSpecificationExecutor<Lesson> {
    boolean existsByLessontitle(String lessontitle);
    // Page<Lesson> findByUsersContainingOrderByCreatedAtDesc(User user, Pageable pageable);
}
