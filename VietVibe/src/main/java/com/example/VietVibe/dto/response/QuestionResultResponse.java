package com.example.VietVibe.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionResultResponse {
    private Long gameId;
    private Long questionId;
    private boolean correct;          // câu này đúng không
    private Long correctAnswerId;     // với MCQ / LISTENING
    private List<Long> correctOrder;
}
