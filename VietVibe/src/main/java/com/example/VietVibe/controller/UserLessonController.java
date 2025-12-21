package com.example.VietVibe.controller;

import com.example.VietVibe.dto.request.UserLessonCreateRequest;
import com.example.VietVibe.service.UserLessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/progress")
@RequiredArgsConstructor
public class UserLessonController {

    private final UserLessonService userLessonService;

    // API: Lưu tiến độ (thường gọi khi user pause video hoặc mỗi 5-10 giây)
    @PostMapping("/save")
    public ResponseEntity<Void> saveProgress(@RequestBody UserLessonCreateRequest request) {
        userLessonService.saveProgress(request.getLessonId(), request.getSeconds());
        return ResponseEntity.ok().build();
    }

    // API: Lấy tiến độ để resume video
    @GetMapping("/{lessonId}")
    public ResponseEntity<Float> getProgress(@PathVariable String lessonId) {
        float seconds = userLessonService.getProgress(lessonId);
        return ResponseEntity.ok(seconds);
    }
}