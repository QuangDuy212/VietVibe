package com.example.VietVibe.dto.request;

import com.example.VietVibe.enums.LessonLevel;

import jakarta.validation.constraints.NotBlank;
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
public class LessonCreationRequest {
    @NotBlank
    String lessontitle;

    String videourl;

    String description;
    LessonLevel level;
    String time;
    int durationSeconds;
}
