package com.example.VietVibe.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.request.GameUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.Answer;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.Question;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.GameMapper;
import com.example.VietVibe.repository.GameRepository;

import jakarta.transaction.Transactional;
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

    public ApiPagination<GameResponse> getAllGames(Specification<Game> spec, Pageable pageable) {

        log.info("Get all games");
        Page<Game> pageGame = this.gameRepository.findAll(spec, pageable);

        List<GameResponse> listGame = pageGame.getContent().stream().map(gameMapper::toGameResponse).toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();

        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageGame.getTotalPages());
        mt.setTotal(pageGame.getTotalElements());

        return ApiPagination.<GameResponse>builder()
                .meta(mt)
                .result(listGame)
                .build();
    }

    public GameResponse create(GameCreationRequest request) {
        Game game = gameMapper.toGame(request);
        gameRepository.save(game);
        return gameMapper.toGameResponse(game);
    }

    //Update thủ công
    // @Transactional
    // public Game updateGame(Long id, GameCreationRequest request) {
    //     Game game = gameRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Game not found"));

    //     game.setName(request.getName());
    //     game.setDescription(request.getDescription());
    //     game.setType(request.getType());

    //     // cập nhật question
    //     for (QuestionCreationRequest qReq : request.getQuestions()) {
    //         if (qReq.getId() != null) {
    //             // Nếu có ID -> update
    //             Question question = game.getQuestions().stream()
    //                     .filter(q -> q.getId().equals(qReq.getId()))
    //                     .findFirst()
    //                     .orElseThrow(() -> new RuntimeException("Question not found"));

    //             question.setContent(qReq.getContent());
    //             question.setImageUrl(qReq.getImageUrl());
    //             question.setAudioUrl(qReq.getAudioUrl());

    //             // update answer
    //             for (AnswerCreationRequest aReq : qReq.getAnswers()) {
    //                 if (aReq.getId() != null) {
    //                     Answer answer = question.getAnswers().stream()
    //                             .filter(a -> a.getId().equals(aReq.getId()))
    //                             .findFirst()
    //                             .orElseThrow(() -> new RuntimeException("Answer not found"));
    //                     answer.setContent(aReq.getContent());
    //                     answer.setCorrect(aReq.isCorrect());
    //                     answer.setOrderIndex(aReq.getOrderIndex());
    //                 } else {
    //                     // thêm mới answer
    //                     Answer newAnswer = Answer.builder()
    //                             .content(aReq.getContent())
    //                             .isCorrect(aReq.isCorrect())
    //                             .orderIndex(aReq.getOrderIndex())
    //                             .question(question)
    //                             .build();
    //                     question.getAnswers().add(newAnswer);
    //                 }
    //             }

    //         } else {
    //             // Thêm mới question
    //             Question newQ = Question.builder()
    //                     .content(qReq.getContent())
    //                     .imageUrl(qReq.getImageUrl())
    //                     .audioUrl(qReq.getAudioUrl())
    //                     .game(game)
    //                     .build();

    //             // thêm answer mới
    //             for (AnswerCreationRequest aReq : qReq.getAnswers()) {
    //                 Answer newAnswer = Answer.builder()
    //                         .content(aReq.getContent())
    //                         .isCorrect(aReq.isCorrect())
    //                         .orderIndex(aReq.getOrderIndex())
    //                         .question(newQ)
    //                         .build();
    //                 newQ.getAnswers().add(newAnswer);
    //             }

    //             game.getQuestions().add(newQ);
    //         }
    //     }

    //     return gameRepository.save(game);
    // }

    //Update kiểu xóa đi câu hỏi cũ thêm lại bằng câu hỏi mới
    public GameResponse updateGame(Long id, GameUpdateRequest request) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));
        
        game.setName(request.getName());
        game.setDescription(request.getDescription());
        game.setType(request.getType());

        // update lại list câu hỏi (xóa cũ, thêm mới nếu có thay đổi)
        game.getQuestions().clear();
        game.getQuestions().addAll(request.getQuestions());

        gameRepository.save(game);

        return gameMapper.toGameResponse(game);
    }

    public void delete(long id) {
        gameRepository.deleteById(id);
    }
}
