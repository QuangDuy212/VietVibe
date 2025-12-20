package com.example.VietVibe.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class ResUploadFileDTO {
    String fileName;
    Instant uploadedAt;
    long durationSeconds; // Thời lượng tính bằng giây
    String durationFormatted; // Định dạng kiểu 05:30 (nếu muốn)
}
