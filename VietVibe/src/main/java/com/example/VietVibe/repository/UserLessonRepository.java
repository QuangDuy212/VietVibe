package com.example.VietVibe.repository;

import com.example.VietVibe.entity.UserLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserLessonRepository extends JpaRepository<UserLesson, String> {
    // Tìm bản ghi tiến độ của một user cụ thể cho một bài học cụ thể
    Optional<UserLesson> findByUserIdAndLessonId(String userId, String lessonId);
    // Thêm dòng này để hỗ trợ lấy tiến độ theo danh sách ID bài học
    List<UserLesson> findByUserIdAndLessonIdIn(String userId, List<String> lessonIds);
    long countByUserIdAndProgessGreaterThanEqual(String id, float f);
}