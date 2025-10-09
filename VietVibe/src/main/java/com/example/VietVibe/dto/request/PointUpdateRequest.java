package com.example.VietVibe.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointUpdateRequest {
    private Long pointId;
    private int score;
    private int bonus;
}