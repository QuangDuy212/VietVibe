package com.example.VietVibe.dto.request;

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
public class LessonDetailCreationRequest {
    @NotBlank(message = "Gramma cannot be blank")
    String gramma;

    String vocab;

    String phonetic;

    @NotBlank(message = "Lesson ID cannot be blank")
    String lessonId;
}
