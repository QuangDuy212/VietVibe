package com.example.VietVibe.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponse {
    private int totalPoints;
    private int gamesPlayed; 
    private int highestScore;
}