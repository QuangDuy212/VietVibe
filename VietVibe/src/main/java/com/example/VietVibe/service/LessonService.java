package com.example.VietVibe.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.LessonCreationRequest;
import com.example.VietVibe.dto.request.LessonUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.CountElementResponse;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.dto.response.LessonResponse;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.entity.UserLesson;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.LessonMapper;
import com.example.VietVibe.repository.LessonRepository;
import com.example.VietVibe.repository.UserLessonRepository;
import com.example.VietVibe.repository.LessonDetailRepository;
import com.example.VietVibe.repository.VocabularyRepository;
import com.example.VietVibe.repository.UserRepository;
import com.example.VietVibe.util.SecurityUtil;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonService {
    LessonRepository lessonRepository;
    UserLessonRepository userLessonRepository;
    LessonMapper lessonMapper;
    LessonDetailRepository lessonDetailRepository;
    VocabularyRepository vocabularyRepository;
    @Autowired
    UserRepository userRepository;

    public LessonResponse create(LessonCreationRequest request) {
        log.info("Create a lesson");
        if (lessonRepository.existsByLessontitle(request.getLessontitle())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        Lesson lesson = lessonMapper.toLesson(request);
        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    public LessonResponse getDetailLesson(String id) {
        log.info("Get detail lesson");
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return lessonMapper.toLessonResponse(lesson);
    }

    public LessonResponse update(String id, LessonUpdateRequest request) {
        log.info("Update lesson");
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if (request.getLessontitle() != null && !request.getLessontitle().equals(lesson.getLessontitle())) {
            if (lessonRepository.existsByLessontitle(request.getLessontitle())) {
                throw new AppException(ErrorCode.CATEGORY_EXISTED);
            }
        }
        lessonMapper.updateLesson(lesson, request);
        return lessonMapper.toLessonResponse(lessonRepository.save(lesson));
    }

    public void delete(String id) {
        log.info("Delete lesson");
        Lesson lesson = lessonRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // delete vocabularies belonging to this lesson (if any)
        try {
            if (lesson.getVocabularies() != null && !lesson.getVocabularies().isEmpty()) {
                vocabularyRepository.deleteAll(lesson.getVocabularies());
            }
        } catch (Exception ex) {
            log.warn("Failed to delete vocabularies for lesson {}: {}", id, ex.getMessage());
        }

        // delete lesson detail if exists
        try {
            if (lesson.getLessonDetail() != null) {
                lessonDetailRepository.delete(lesson.getLessonDetail());
            }
        } catch (Exception ex) {
            log.warn("Failed to delete lesson detail for lesson {}: {}", id, ex.getMessage());
        }

        // finally delete the lesson itself
        lessonRepository.delete(lesson);
    }

    public List<LessonResponse> getAllLessons() {
        log.info("Get all lessons (no paging)");
        List<Lesson> list = lessonRepository.findAll();
        return list.stream().map(lessonMapper::toLessonResponse).toList();
    }

    public ApiPagination<LessonResponse> getAllLessonsPagination(Specification<Lesson> spec, Pageable pageable) {
        log.info("Get all lessons with user progress");

        // 1. Lấy trang Lesson như cũ
        Page<Lesson> pageLesson = this.lessonRepository.findAll(spec, pageable);

        // 2. Lấy thông tin User hiện tại
        String username = SecurityUtil.getCurrentUserLogin().orElse(null);
        Map<String, Float> progressMap = new HashMap<>();

        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                // Lấy list ID của các bài học trong trang hiện tại
                List<String> lessonIds = pageLesson.getContent().stream()
                        .map(Lesson::getId)
                        .toList();

                // Chỉ query tiến độ của những bài học trong trang này (Tối ưu performance)
                List<UserLesson> userProgresses = userLessonRepository.findByUserIdAndLessonIdIn(user.getId(),
                        lessonIds);

                // Chuyển thành Map <LessonID, Seconds>
                progressMap = userProgresses.stream()
                        .collect(Collectors.toMap(
                                ul -> ul.getLesson().getId(),
                                UserLesson::getProgess));
            }
        }

        // 3. Map từ Lesson sang LessonResponse và nhét thêm số giây vào
        final Map<String, Float> finalProgressMap = progressMap; // Để dùng trong lambda
        List<LessonResponse> listLesson = pageLesson.getContent().stream()
                .map(lesson -> {
                    LessonResponse res = lessonMapper.toLessonResponse(lesson);
                    // Nếu tìm thấy tiến độ thì set, không thì mặc định là 0
                    res.setProgress(finalProgressMap.getOrDefault(lesson.getId(), (float) 0));
                    return res;
                })
                .toList();

        // 4. Trả về kết quả phân trang như cũ
        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageLesson.getTotalPages());
        mt.setTotal(pageLesson.getTotalElements());

        return ApiPagination.<LessonResponse>builder()
                .meta(mt)
                .result(listLesson)
                .build();
    }

    public long getCountCompletedLessons() {
        String username = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {

                return userLessonRepository.countByUserIdAndProgessGreaterThanEqual(user.getId(), 100.0f);
            }
        }
        return 0;
    }
    public CountElementResponse countLessons() {
        long count = this.lessonRepository.count();
        return CountElementResponse.builder()
                .count(count)
                .build();
    }
}
