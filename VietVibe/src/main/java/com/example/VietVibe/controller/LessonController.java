package com.example.VietVibe.controller;

import java.util.List;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.VietVibe.dto.request.LessonCreationRequest;
import com.example.VietVibe.dto.request.LessonUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.LessonResponse;
import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.service.LessonService;
import com.example.VietVibe.util.annotation.ApiMessage;
import com.example.VietVibe.util.annotation.PublicEndpoint;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonController {
    LessonService lessonService;

    @PublicEndpoint
    @PostMapping
    @ApiMessage("Create a lesson success")
    ResponseEntity<LessonResponse> createLesson(@RequestBody @Valid LessonCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.lessonService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all lessons success")
    ResponseEntity<ApiPagination<LessonResponse>> getLessons(@Filter Specification<Lesson> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.lessonService.getAllLessons(spec, pageable));
    }
    
    @GetMapping("/all")
    @ApiMessage("Get all lessons (no paging) success")
    ResponseEntity<List<LessonResponse>> getAllNoPaging() {
        return ResponseEntity.ok().body(this.lessonService.getAllLessons());
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail lesson success")
    ResponseEntity<LessonResponse> getLesson(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.lessonService.getDetailLesson(id));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a lesson success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        lessonService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a lesson success")
    ResponseEntity<LessonResponse> updateLesson(@PathVariable String id, @RequestBody LessonUpdateRequest request) {
        return ResponseEntity.ok().body(this.lessonService.update(id, request));
    }
}
