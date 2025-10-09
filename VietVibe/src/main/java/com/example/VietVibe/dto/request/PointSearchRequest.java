package com.example.VietVibe.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PointSearchRequest {
    private String keyword;
    private String username;
    private String gameName;
    private Integer minScore;
    private Integer maxScore;
    private LocalDateTime from;
    private LocalDateTime to;
}
