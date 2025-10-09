package com.example.VietVibe.dto.response;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonResponse {
    String _id;
    String lessontitle;
    String videourl;
    String description;
    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
}
