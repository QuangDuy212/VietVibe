package com.example.VietVibe.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PUBLIC)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class PointResponse {
    private Long id;
    private String userId;
    private String userName;
    private Long gameId;      
    private String gameType; 
    private String gameName;      
    private int score;
    private int bonus;
    private int correctAnswers;
    private int totalQuestions;
    private LocalDateTime createdAt;
}