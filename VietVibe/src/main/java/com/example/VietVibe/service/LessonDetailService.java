package com.example.VietVibe.service;

import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.LessonDetailCreationRequest;
import com.example.VietVibe.dto.request.LessonDetailUpdateRequest;
import com.example.VietVibe.dto.response.LessonDetailResponse;
import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.LessonDetail;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.LessonDetailMapper;
import com.example.VietVibe.repository.LessonDetailRepository;
import com.example.VietVibe.repository.LessonRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonDetailService {
    LessonDetailRepository lessonDetailRepository;
    LessonDetailMapper lessonDetailMapper;
    LessonRepository lessonRepository;

    public LessonDetailResponse create(LessonDetailCreationRequest request) {
        log.info("Create a lesson detail");

        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Check if lesson already has a detail
        if (lesson.getLessonDetail() != null) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        LessonDetail lessonDetail = lessonDetailMapper.toLessonDetail(request);
        lessonDetail.setLesson(lesson);

        lessonDetail = lessonDetailRepository.save(lessonDetail);
        return lessonDetailMapper.toLessonDetailResponse(lessonDetail);
    }

    public LessonDetailResponse getDetailLessonDetail(String id) {
        log.info("Get detail lesson detail");
        LessonDetail lessonDetail = lessonDetailRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return lessonDetailMapper.toLessonDetailResponse(lessonDetail);
    }

    public LessonDetailResponse update(String id, LessonDetailUpdateRequest request) {
        log.info("Update lesson detail");
        LessonDetail lessonDetail = lessonDetailRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getLessonId() != null && !request.getLessonId().isEmpty()) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            lessonDetail.setLesson(lesson);
        }

        lessonDetailMapper.updateLessonDetail(lessonDetail, request);
        return lessonDetailMapper.toLessonDetailResponse(lessonDetailRepository.save(lessonDetail));
    }

    public void delete(String id) {
        log.info("Delete lesson detail");
        LessonDetail lessonDetail = lessonDetailRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        lessonDetailRepository.delete(lessonDetail);
    }

    public LessonDetailResponse getByLessonId(String lessonId) {
        log.info("Get lesson detail by lesson id");
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        LessonDetail lessonDetail = lessonDetailRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return lessonDetailMapper.toLessonDetailResponse(lessonDetail);
    }
}
