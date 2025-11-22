package com.example.VietVibe.dto.response;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class PlayQuestionResponse {
    @JsonProperty("_id")
    private Long id;

    private String content;
    private String imageUrl;
    private String audioUrl;

    private List<PlayAnswerResponse> answers;
}
