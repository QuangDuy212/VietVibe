package com.example.VietVibe.dto.response;

import java.util.List;

import com.example.VietVibe.enums.GameType;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class PlayGameResponse {
    @JsonProperty("_id")
    private Long id;

    private String name;
    private String description;
    private GameType type;

    private int totalQuestions;
    private List<PlayQuestionResponse> questions;
}
