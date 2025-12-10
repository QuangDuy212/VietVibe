package com.example.VietVibe.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PlayAnswerResponse {
    @JsonProperty("_id")
    private Long id;

    private String content;
}
