package com.example.VietVibe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.dto.response.PlayAnswerResponse;
import com.example.VietVibe.dto.response.PlayGameResponse;
import com.example.VietVibe.dto.response.PlayQuestionResponse;
import com.example.VietVibe.entity.Answer;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.Question;

@Mapper(componentModel = "spring")
public interface GameMapper {
    Game toGame(GameCreationRequest request);

    @Mapping(target = "timesPlayed", source = "timesPlayed")
    @Mapping(target = "bestScore", source = "bestScore")
    GameResponse toGameResponse(Game game);

    PlayGameResponse toPlayGameResponse(Game game);

    PlayQuestionResponse toPlayQuestionResponse(Question question);

    PlayAnswerResponse toPlayAnswerResponse(Answer answer);
}
