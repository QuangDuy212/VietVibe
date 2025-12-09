package com.example.VietVibe.service;

import com.example.VietVibe.dto.request.PointRequest;
import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.GameStatsResponse;
import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.dto.response.UserStatsResponse;
import com.example.VietVibe.entity.Point;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.PointMapper;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.repository.PointRepository;
import com.example.VietVibe.repository.UserRepository;
import com.example.VietVibe.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PointService {

        @Autowired
        private PointRepository pointRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private GameRepository gameRepository;

        @Autowired
        private PointMapper pointMapper;

        // Chấm điểm và lưu điểm
        // public PointResponse addPoint(PointRequest request) {
        //         User user = userRepository.findById(request.getUserId())
        //                         .orElseThrow(() -> new RuntimeException("User not found"));
        //         Game game = gameRepository.findById(request.getGameId())
        //                         .orElseThrow(() -> new RuntimeException("Game not found"));

        //         // Tính bonus tự động
        //         int bonus = 0;
        //         if (request.getCorrectAnswers() == request.getTotalQuestions()) {
        //                 bonus = 5;
        //         }

        //         Point point = Point.builder()
        //                         .score(request.getScore())
        //                         .bonus(bonus)
        //                         .game(game)
        //                         .correctAnswers(request.getCorrectAnswers())
        //                         .totalQuestions(request.getTotalQuestions())
        //                         .createdAt(LocalDateTime.now())
        //                         .user(user)
        //                         .build();
        //         point = pointRepository.save(point);
        //         return pointMapper.toResponse(point);
        // }

        // lay toàn bộ điểm
        public List<PointResponse> getAllPoints() {
                List<Point> points = pointRepository.findAll();

                if (points.isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No points found");
                }

                return points.stream()
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        // Tổng điểm của user
        public int getTotalScore(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<Point> points = pointRepository.findByUser(user);
                return points.stream().mapToInt(p -> p.getScore() + p.getBonus()).sum();
        }

        // Điểm trung bình của user
        public double getAverageScore(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<Point> points = pointRepository.findByUser(user);
                return points.isEmpty() ? 0
                                : points.stream().mapToInt(p -> p.getScore() + p.getBonus()).average().orElse(0);
        }

        // Số game đã chơi
        public int getTotalGames(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<Point> points = pointRepository.findByUser(user);
                return (int) points.stream().map(p -> p.getGame().getId()).distinct().count();
        }

        // Lịch sử làm bài của user
        public List<PointResponse> getHistory(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return pointRepository.findByUser(user)
                                .stream()
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        // Lịch sử theo game
        public List<PointResponse> getHistoryByGame(String userId, Long gameId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new RuntimeException("Game not found"));
                return pointRepository.findByUserAndGame(user, game)
                                .stream()
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        // Chỉnh sửa điểm
        public PointResponse updatePoint(PointUpdateRequest request) {
                Point point = pointRepository.findById(request.getPointId())
                                .orElseThrow(() -> new RuntimeException("Point not found"));
                point.setScore(request.getScore());
                point.setBonus(request.getBonus());
                point = pointRepository.save(point);
                return pointMapper.toResponse(point);
        }

        // Xóa điểm
        public void deletePoint(Long pointId) {
                pointRepository.deleteById(pointId);
        }

        // Thống kê tổng điểm, điểm cao/thấp nhất, phân bố điểm
        public int getMaxScore() {
                return pointRepository.findAll().stream()
                                .mapToInt(p -> p.getScore() + p.getBonus())
                                .max().orElse(0);
        }

        public int getMinScore() {
                return pointRepository.findAll().stream()
                                .mapToInt(p -> p.getScore() + p.getBonus())
                                .min().orElse(0);
        }

        public List<PointResponse> getPointsByScoreRange(int min, int max) {
                return pointRepository.findByScoreBetween(min, max)
                                .stream()
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        // Reset điểm user
        @Transactional
        public void resetUserPoints(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                pointRepository.deleteByUser(user);
        }

        // Reset điểm game
        @Transactional
        public void resetGamePoints(Long gameId) {
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new RuntimeException("Game not found"));
                pointRepository.deleteByGame(game);
        }

        // Tìm kiếm
        public List<PointResponse> search(PointSearchRequest request) {
                Specification<Point> spec = (root, query, cb) -> {
                        Predicate predicate = cb.conjunction();

                        // keyword → tìm theo username hoặc gameName
                        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                                String like = "%" + request.getKeyword().toLowerCase() + "%";
                                predicate = cb.and(predicate, cb.or(
                                                cb.like(cb.lower(root.get("user").get("username")), like),
                                                cb.like(cb.lower(root.get("game").get("name")), like)));
                        }

                        // username
                        if (request.getUsername() != null && !request.getUsername().isBlank()) {
                                predicate = cb.and(predicate,
                                                cb.like(cb.lower(root.get("user").get("username")),
                                                                "%" + request.getUsername().toLowerCase() + "%"));
                        }

                        // gameName
                        if (request.getGameName() != null && !request.getGameName().isBlank()) {
                                predicate = cb.and(predicate,
                                                cb.like(cb.lower(root.get("game").get("name")),
                                                                "%" + request.getGameName().toLowerCase() + "%"));
                        }

                        // score range (score + bonus)
                        if (request.getMinScore() != null) {
                                predicate = cb.and(predicate,
                                                cb.greaterThanOrEqualTo(
                                                                cb.sum(root.get("score"), root.get("bonus")),
                                                                request.getMinScore()));
                        }
                        if (request.getMaxScore() != null) {
                                predicate = cb.and(predicate,
                                                cb.lessThanOrEqualTo(
                                                                cb.sum(root.get("score"), root.get("bonus")),
                                                                request.getMaxScore()));
                        }

                        // createdAt range
                        if (request.getFrom() != null) {
                                predicate = cb.and(predicate,
                                                cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFrom()));
                        }
                        if (request.getTo() != null) {
                                predicate = cb.and(predicate,
                                                cb.lessThanOrEqualTo(root.get("createdAt"), request.getTo()));
                        }

                        return predicate;
                };

                return pointRepository.findAll(spec).stream()
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        public Point createGamePoint(Long gameId, String username, PointRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_FOUND));

                Point point = Point.builder() // "GAME_PLAY"
                                .score(request.getScore())
                                .bonus(10)
                                .correctAnswers(request.getCorrectAnswers())
                                .totalQuestions(request.getTotalQuestions())
                                .createdAt(LocalDateTime.now())
                                .user(user)
                                .game(game)
                                .build();

                return pointRepository.save(point);
        }

        public GameStatsResponse getGameStats(Long gameId) {
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new AppException(ErrorCode.GAME_NOT_FOUND));

                long timesPlayed = pointRepository.countByGame(game);
                int bestScore = pointRepository.findTopByGameOrderByScoreDesc(game)
                                .map(Point::getScore)
                                .orElse(0);

                return GameStatsResponse.builder()
                                .gameId(game.getId())
                                .timesPlayed(timesPlayed)
                                .bestScore(bestScore)
                                .build();
        }

        // ========== PAGED API ==========
        public ApiPagination<PointResponse> getAllPoints(Specification<Point> spec, Pageable pageable) {
                Page<Point> pagePoint = pointRepository.findAll(spec, pageable);

                List<PointResponse> listPoint = pagePoint.getContent()
                                .stream()
                                .map(pointMapper::toResponse)
                                .toList();

                ApiPagination.Meta mt = new ApiPagination.Meta();
                mt.setCurrent(pagePoint.getNumber() + 1);
                mt.setPageSize(pagePoint.getSize());
                mt.setPages(pagePoint.getTotalPages());
                mt.setTotal(pagePoint.getTotalElements());

                return ApiPagination.<PointResponse>builder()
                                .meta(mt)
                                .result(listPoint)
                                .build();
        }

        public ApiPagination<PointResponse> search(PointSearchRequest request, Pageable pageable) {
                Specification<Point> spec = buildSearchSpec(request);
                Page<Point> pagePoint = pointRepository.findAll(spec, pageable);

                List<PointResponse> listPoint = pagePoint.getContent()
                                .stream()
                                .map(pointMapper::toResponse)
                                .toList();

                ApiPagination.Meta mt = new ApiPagination.Meta();
                mt.setCurrent(pagePoint.getNumber() + 1);
                mt.setPageSize(pagePoint.getSize());
                mt.setPages(pagePoint.getTotalPages());
                mt.setTotal(pagePoint.getTotalElements());

                return ApiPagination.<PointResponse>builder()
                                .meta(mt)
                                .result(listPoint)
                                .build();
        }

        // helper to build spec
        private Specification<Point> buildSearchSpec(PointSearchRequest request) {
                return (root, query, cb) -> {
                        Predicate predicate = cb.conjunction();

                        if (request == null)
                                return predicate;

                        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                                String like = "%" + request.getKeyword().toLowerCase() + "%";
                                predicate = cb.and(predicate, cb.or(
                                                cb.like(cb.lower(root.get("user").get("username")), like),
                                                cb.like(cb.lower(root.get("game").get("name")), like)));
                        }

                        if (request.getUsername() != null && !request.getUsername().isBlank()) {
                                predicate = cb.and(predicate,
                                                cb.like(cb.lower(root.get("user").get("username")),
                                                                "%" + request.getUsername().toLowerCase() + "%"));
                        }

                        if (request.getGameName() != null && !request.getGameName().isBlank()) {
                                predicate = cb.and(predicate,
                                                cb.like(cb.lower(root.get("game").get("name")),
                                                                "%" + request.getGameName().toLowerCase() + "%"));
                        }

                        if (request.getMinScore() != null) {
                                predicate = cb.and(predicate,
                                                cb.greaterThanOrEqualTo(
                                                                cb.sum(root.get("score"), root.get("bonus")),
                                                                request.getMinScore()));
                        }
                        if (request.getMaxScore() != null) {
                                predicate = cb.and(predicate,
                                                cb.lessThanOrEqualTo(
                                                                cb.sum(root.get("score"), root.get("bonus")),
                                                                request.getMaxScore()));
                        }

                        // Support from/to as LocalDate or LocalDateTime depending on your DTO
                        if (request.getFrom() != null) {
                                predicate = cb.and(predicate,
                                                cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFrom()));
                        }
                        if (request.getTo() != null) {
                                predicate = cb.and(predicate,
                                                cb.lessThanOrEqualTo(root.get("createdAt"), request.getTo()));
                        }

                        return predicate;
                };
        }


        // Cập nhật addPoint với bonus logic
        public PointResponse addPoint(PointRequest request) {
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Game game = gameRepository.findById(request.getGameId())
                                .orElseThrow(() -> new RuntimeException("Game not found"));
                int bonus = (request.getCorrectAnswers() == request.getTotalQuestions()) ? 5 : 0;
                Point point = Point.builder()
                                .score(request.getScore())
                                .bonus(bonus)
                                .game(game)
                                .correctAnswers(request.getCorrectAnswers())
                                .totalQuestions(request.getTotalQuestions())
                                .createdAt(LocalDateTime.now())
                                .user(user)
                                .build();
                point = pointRepository.save(point);

                // Cập nhật bestScore cho game
                int newScore = point.getScore() + bonus;
                if (newScore > game.getBestScore()) {
                        game.setBestScore(newScore);
                        gameRepository.save(game);
                }
                return pointMapper.toResponse(point);
        }

        // Mới: Get user stats
        public UserStatsResponse getUserStats(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                List<Point> points = pointRepository.findByUser(user);
                int totalPoints = points.stream().mapToInt(p -> p.getScore() + p.getBonus()).sum();
                int gamesPlayed = points.size(); // Tổng times played
                int highestScore = points.stream().mapToInt(p -> p.getScore() + p.getBonus()).max().orElse(0);
                return UserStatsResponse.builder()
                                .totalPoints(totalPoints)
                                .gamesPlayed(gamesPlayed)
                                .highestScore(highestScore)
                                .build();
        }

}