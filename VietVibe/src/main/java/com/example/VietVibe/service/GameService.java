package com.example.VietVibe.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.request.GameUpdateRequest;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.GameMapper;
import com.example.VietVibe.repository.GameRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class GameService {
    GameRepository gameRepository;
    GameMapper gameMapper;

    public GameResponse getGameById(Long id) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));
        return gameMapper.toGameResponse(game);
    }

    public GameResponse create(GameCreationRequest request){
        Game game = gameMapper.toGame(request);
        gameRepository.save(game);
        return gameMapper.toGameResponse(game);
    }

    public GameResponse update(long id,GameUpdateRequest request){
        Game game = gameRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));
        game.setName(request.getName());
        game.setDescription(request.getDescription());
        return null;
    }

    public void delete(long id){
        gameRepository.deleteById(id);
    }
}
