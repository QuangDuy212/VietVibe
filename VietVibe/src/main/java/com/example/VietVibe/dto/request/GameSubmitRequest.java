package com.example.VietVibe.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class GameSubmitRequest {
    private Long gameId;
    private QuestionAnswerRequest answers;
}
