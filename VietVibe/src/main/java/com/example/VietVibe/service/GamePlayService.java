package com.example.VietVibe.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.GameSubmitRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.PlayGameResponse;
import com.example.VietVibe.dto.response.QuestionResultResponse;
import com.example.VietVibe.entity.Answer;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.Question;
import com.example.VietVibe.enums.GameType;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.GameMapper;
import com.example.VietVibe.repository.GameRepository;
import com.example.VietVibe.repository.PointRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GamePlayService {
    GameRepository gameRepository;
    PointRepository pointRepository;
    GameMapper gameMapper;

    public ApiPagination<PlayGameResponse> getAllPlayGame(Specification<Game> spec, Pageable pageable) {
        Page<Game> gamePlay = this.gameRepository.findAll(spec, pageable);

        List<PlayGameResponse> listGame = gamePlay.getContent().stream()
                .map(gameMapper::toPlayGameResponse)
                .toList();
        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(gamePlay.getTotalPages());
        mt.setTotal(gamePlay.getTotalElements());
        return ApiPagination.<PlayGameResponse>builder()
                .meta(mt)
                .result(listGame)
                .build();
    }

    public PlayGameResponse getPlayGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));
        return gameMapper.toPlayGameResponse(game);
    }

    public QuestionResultResponse submitQuestion(Long gameId, GameSubmitRequest request) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_EXISTED));

        Question question = game.getQuestions().stream()
                .filter(q -> q.getId().equals(request.getAnswers().getQuestionId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_EXISTED));

        boolean isCorrect = false;
        Long correctAnswerId = null;
        List<Long> correctOrder = null;
        if (game.getType() == GameType.MULTIPLE_CHOICE || game.getType() == GameType.LISTENING_CHOICE) {

            Long selectedAnswerId = request.getAnswers().getAnswerId();
            // Tìm đáp án đúng trong db
            correctAnswerId = question.getAnswers().stream()
                    .filter(ans -> ans.isCorrect())
                    .findFirst()
                    .map(ans -> ans.getId())
                    .orElse(null);
            isCorrect = selectedAnswerId != null && selectedAnswerId.equals(correctAnswerId);
        } else if (game.getType() == GameType.SENTENCE_ORDER) {
            List<Long> userOder = request.getAnswers().getOrderedAnswerIds();
            if (userOder == null || userOder.isEmpty()) {
                throw new AppException(ErrorCode.QUESTION_NOT_EXISTED);
            }
            correctOrder = question.getAnswers().stream()
                    .sorted(Comparator.comparing(Answer::getOrderIndex))
                    .map(Answer::getId)
                    .toList();
            isCorrect = userOder.equals(correctOrder);
        }
        return QuestionResultResponse.builder()
                .gameId(game.getId())
                .questionId(question.getId())
                .correct(isCorrect)
                .correctAnswerId(correctAnswerId)
                .correctOrder(correctOrder)
                .build();
    }
}
