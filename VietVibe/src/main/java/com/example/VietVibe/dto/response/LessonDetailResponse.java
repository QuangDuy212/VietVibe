package com.example.VietVibe.dto.response;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonDetailResponse {
    @JsonProperty("_id")
    String id;

    String gramma;

    String vocab;

    String phonetic;

    String lessonId;

    Instant createdAt;

    Instant updatedAt;

    String createdBy;

    String updatedBy;
}
