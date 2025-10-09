package com.example.VietVibe.dto.request;

import java.util.ArrayList;

import com.example.VietVibe.entity.Question;
import com.example.VietVibe.enums.GameType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonPropertyOrder(alphabetic = true)
public class GameUpdateRequest {
    @JsonProperty("_id")
    String id;
    
    String name;

    String description;

    GameType type;

    ArrayList<Question> questions = new ArrayList<>();
}
