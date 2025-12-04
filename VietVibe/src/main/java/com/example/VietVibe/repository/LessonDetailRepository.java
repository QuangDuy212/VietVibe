package com.example.VietVibe.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.VietVibe.entity.LessonDetail;

@Repository
public interface LessonDetailRepository extends JpaRepository<LessonDetail, String>, JpaSpecificationExecutor<LessonDetail> {
    Optional<LessonDetail> findByLessonId(String lessonId);
}
