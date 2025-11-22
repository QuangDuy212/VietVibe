package com.example.VietVibe.dto.request;

import java.util.List;

import lombok.Data;

@Data
public class QuestionAnswerRequest {
    private Long questionId;

    private Long answerId;

    private List<Long> orderedAnswerIds;
}
