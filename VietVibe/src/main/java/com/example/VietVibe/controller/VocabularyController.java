package com.example.VietVibe.controller;

import java.util.List;

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

import com.example.VietVibe.dto.request.VocabularyCreationRequest;
import com.example.VietVibe.dto.request.VocabularyUpdateRequest;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.VocabularyResponse;
import com.example.VietVibe.service.VocabularyService;
import com.example.VietVibe.util.annotation.ApiMessage;
import com.example.VietVibe.util.annotation.PublicEndpoint;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/vocabularies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyController {
    VocabularyService vocabularyService;

    @PublicEndpoint
    @PostMapping
    @ApiMessage("Create a vocabulary success")
    ResponseEntity<VocabularyResponse> createVocabulary(@RequestBody @Valid VocabularyCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.vocabularyService.create(request));
    }

    @PublicEndpoint
    @PostMapping("/batch")
    @ApiMessage("Create vocabularies batch success")
    ResponseEntity<List<VocabularyResponse>> createVocabulariesBatch(@RequestBody List<@Valid VocabularyCreationRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.vocabularyService.create(requests));
    }

    @GetMapping("/all")
    @ApiMessage("Get all vocabularies (no paging) success")
    ResponseEntity<List<VocabularyResponse>> getAllNoPaging() {
        return ResponseEntity.ok().body(this.vocabularyService.getAllVocabularies());
    }

    @GetMapping("/lesson/{lessonId}")
    @ApiMessage("Get vocabularies by lesson id success")
    ResponseEntity<List<VocabularyResponse>> getVocabulariesByLessonId(@PathVariable String lessonId) {
        return ResponseEntity.ok().body(this.vocabularyService.getVocabulariesByLessonId(lessonId));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail vocabulary success")
    ResponseEntity<VocabularyResponse> getVocabulary(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.vocabularyService.getDetailVocabulary(id));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a vocabulary success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        vocabularyService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a vocabulary success")
    ResponseEntity<VocabularyResponse> updateVocabulary(@PathVariable String id,
            @RequestBody VocabularyUpdateRequest request) {
        return ResponseEntity.ok().body(this.vocabularyService.update(id, request));
    }
}
