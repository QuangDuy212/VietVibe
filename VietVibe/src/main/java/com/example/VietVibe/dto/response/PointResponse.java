package com.example.VietVibe.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PointResponse {
    private Long id;
    private String userId;
    private String userName;
    private Long gameId;      
    private String gameType;       
    private int score;
    private int bonus;
    private int correctAnswers;
    private int totalQuestions;
    private LocalDateTime createdAt;
}