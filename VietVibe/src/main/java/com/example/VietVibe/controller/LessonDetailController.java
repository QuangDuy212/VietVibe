package com.example.VietVibe.controller;

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

import com.example.VietVibe.dto.request.LessonDetailCreationRequest;
import com.example.VietVibe.dto.request.LessonDetailUpdateRequest;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.LessonDetailResponse;
import com.example.VietVibe.service.LessonDetailService;
import com.example.VietVibe.util.annotation.ApiMessage;
import com.example.VietVibe.util.annotation.PublicEndpoint;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/lesson-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonDetailController {
    LessonDetailService lessonDetailService;

    @PublicEndpoint
    @PostMapping
    @ApiMessage("Create a lesson detail success")
    ResponseEntity<LessonDetailResponse> createLessonDetail(@RequestBody @Valid LessonDetailCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.lessonDetailService.create(request));
    }

    @GetMapping("/lesson/{lessonId}")
    @ApiMessage("Get lesson detail by lesson id success")
    ResponseEntity<LessonDetailResponse> getLessonDetailByLessonId(@PathVariable String lessonId) {
        return ResponseEntity.ok().body(this.lessonDetailService.getByLessonId(lessonId));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail lesson detail success")
    ResponseEntity<LessonDetailResponse> getLessonDetail(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.lessonDetailService.getDetailLessonDetail(id));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a lesson detail success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        lessonDetailService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a lesson detail success")
    ResponseEntity<LessonDetailResponse> updateLessonDetail(@PathVariable String id,
            @RequestBody LessonDetailUpdateRequest request) {
        return ResponseEntity.ok().body(this.lessonDetailService.update(id, request));
    }
}
