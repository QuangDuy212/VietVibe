package com.example.VietVibe.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.request.GameUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.entity.Answer;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.Question;
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

    @Transactional
    public GameResponse updateGame(Long id, GameUpdateRequest request) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));

        // update basic fields
        game.setName(request.getName());
        game.setDescription(request.getDescription());
        game.setType(request.getType());

        // Map hiện có (question cũ)
        Map<Long, Question> existingQuestions = game.getQuestions().stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        // Duyệt qua request
        List<Question> updatedQuestions = new ArrayList<>();
        for (Question newQ : request.getQuestions()) {
            if (newQ.getId() != null && existingQuestions.containsKey(newQ.getId())) {
                // update question cũ
                Question oldQ = existingQuestions.get(newQ.getId());
                oldQ.setContent(newQ.getContent());
                oldQ.setImageUrl(newQ.getImageUrl());
                oldQ.setAudioUrl(newQ.getAudioUrl());

                // xử lý answers
                Map<Long, Answer> existingAnswers = oldQ.getAnswers().stream()
                        .collect(Collectors.toMap(Answer::getId, a -> a));

                List<Answer> updatedAnswers = new ArrayList<>();
                for (Answer newA : newQ.getAnswers()) {
                    if (newA.getId() != null && existingAnswers.containsKey(newA.getId())) {
                        // update answer cũ
                        Answer oldA = existingAnswers.get(newA.getId());
                        oldA.setContent(newA.getContent());
                        oldA.setCorrect(newA.isCorrect());
                        updatedAnswers.add(oldA);
                    } else {
                        // thêm answer mới
                        newA.setQuestion(oldQ);
                        updatedAnswers.add(newA);
                    }
                }

                // xóa answer thừa
                oldQ.getAnswers().clear();
                oldQ.getAnswers().addAll(updatedAnswers);

                updatedQuestions.add(oldQ);
            } else {
                // thêm question mới
                newQ.setGame(game);
                newQ.getAnswers().forEach(a -> a.setQuestion(newQ));
                updatedQuestions.add(newQ);
            }
        }

        // xóa question thừa
        game.getQuestions().clear();
        game.getQuestions().addAll(updatedQuestions);

        Game saved = gameRepository.save(game);
        return gameMapper.toGameResponse(saved);
    }

    public void delete(long id) {
        gameRepository.deleteById(id);
    }
}
