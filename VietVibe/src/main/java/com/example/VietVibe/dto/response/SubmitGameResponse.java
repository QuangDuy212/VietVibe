package com.example.VietVibe.dto.response;

import java.util.List;

public class SubmitGameResponse {
    private Long gameId;
    private int totalQuestions;
    private int correctCount;
    private double accuracy;

    private List<QuestionResultResponse> details;
}
