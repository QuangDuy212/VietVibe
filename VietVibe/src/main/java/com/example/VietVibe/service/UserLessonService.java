package com.example.VietVibe.service;

import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.entity.UserLesson;
import com.example.VietVibe.repository.LessonRepository;
import com.example.VietVibe.repository.UserLessonRepository;
import com.example.VietVibe.repository.UserRepository;
import com.example.VietVibe.util.SecurityUtil;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserLessonService {

    UserLessonRepository userLessonRepository;
    LessonRepository lessonRepository;
    UserRepository userRepository;

    @Transactional
    public UserLesson saveProgress(String lessonId, float seconds) {
        // 1. Lấy username từ Token
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng nhập!"));

        // 2. Tìm User thực sự trong DB dựa trên username (hoặc email)
        User user = userRepository.findByUsername(username) // Giả sử bạn có method này
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User: " + username));

        // 3. Tìm Lesson thực sự trong DB
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));

        // 4. Tìm bản ghi tiến độ dựa trên ID thực của User và Lesson
        UserLesson progress = userLessonRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> {
                    UserLesson newProgress = new UserLesson();
                    newProgress.setUser(user); // Gán nguyên Object User đã tìm thấy
                    newProgress.setLesson(lesson); // Gán nguyên Object Lesson đã tìm thấy
                    newProgress.setProgess(seconds); // Mặc định là 0 giây
                    return newProgress;
                });

        progress.setProgess(seconds);
        return userLessonRepository.save(progress);
    }

    public Float getProgress(String lessonId) {
        String currentUser = SecurityUtil.getCurrentUserLogin().orElse("");
        return userLessonRepository.findByUserIdAndLessonId(currentUser, lessonId)
                .map(UserLesson::getProgess)
                .orElse((float) 0); // Nếu chưa học bao giờ thì trả về giây thứ 0
    }
}