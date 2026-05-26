package com.example.VietVibe.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiGenerateRequest {
    private String prompt;
    private int count;
    private String level;
    private String gameType;
}
