package com.example.VietVibe.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GameStatsResponse {
    private Long gameId;
    private long timesPlayed;
    private int bestScore;
}
