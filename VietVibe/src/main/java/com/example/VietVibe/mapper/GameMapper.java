package com.example.VietVibe.mapper;

import org.mapstruct.Mapper;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.entity.Game;

@Mapper(componentModel = "spring")
public interface GameMapper {
    Game toGame(GameCreationRequest request);
    GameResponse toGameResponse(Game game);
}
