package com.example.VietVibe.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointRequest {
    private String userId;
    private Long gameId;         
    private int score;
    private int correctAnswers;
    private int totalQuestions;
}