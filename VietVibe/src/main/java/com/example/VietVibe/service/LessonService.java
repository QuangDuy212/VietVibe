package com.example.VietVibe.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.LessonCreationRequest;
import com.example.VietVibe.dto.request.LessonUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.LessonResponse;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.LessonMapper;
import com.example.VietVibe.repository.LessonRepository;

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
    LessonMapper lessonMapper;

    public LessonResponse create(LessonCreationRequest request) {
        log.info("Create a lesson");
        if (lessonRepository.existsByLessontitle(request.getLessontitle())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }
        Lesson lesson = lessonMapper.toLesson(request);
        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    public ApiPagination<LessonResponse> getAllLessons(Specification<Lesson> spec, Pageable pageable) {
        log.info("Get all lessons");
        Page<Lesson> page = lessonRepository.findAll(spec, pageable);
        List<LessonResponse> list = page.getContent().stream().map(lessonMapper::toLessonResponse).toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(page.getTotalPages());
        mt.setTotal(page.getTotalElements());

        return ApiPagination.<LessonResponse>builder().meta(mt).result(list).build();
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
        lessonRepository.delete(lesson);
    }

    public List<LessonResponse> getAllLessons() {
        log.info("Get all lessons (no paging)");
        List<Lesson> list = lessonRepository.findAll();
        return list.stream().map(lessonMapper::toLessonResponse).toList();
    }
    public ApiPagination<LessonResponse> getAllLessonsPagination(Specification<Lesson> spec, Pageable pageable) {
        log.info("Get all lessons");
        Page<Lesson> pageLesson = this.lessonRepository.findAll(spec, pageable);

        List<LessonResponse> listLesson = pageLesson.getContent().stream().map(lessonMapper::toLessonResponse).toList();

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
}
