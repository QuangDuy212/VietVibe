package com.example.VietVibe.service;

import com.example.VietVibe.dto.request.PointRequest;
import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import lombok.AccessLevel;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PointService {

        PointRepository pointRepository;

        UserRepository userRepository;

        GameRepository gameRepository;

        PointMapper pointMapper;

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

        public int getTotalScore(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<Point> points = pointRepository.findByUser(user);
                return points.stream().mapToInt(p -> p.getScore() + p.getBonus()).sum();
        }

        public List<PointResponse> getHistory(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return pointRepository.findByUser(user)
                                .stream()
                                .sorted(Comparator.comparing(Point::getCreatedAt).reversed())
                                .map(pointMapper::toResponse)
                                .collect(Collectors.toList());
        }

        public PointResponse updatePoint(PointUpdateRequest request) {
                Point point = pointRepository.findById(request.getPointId())
                                .orElseThrow(() -> new RuntimeException("Point not found"));
                point.setScore(request.getScore());
                point.setBonus(request.getBonus());
                point = pointRepository.save(point);
                return pointMapper.toResponse(point);
        }

        public void deletePoint(Long pointId) {
                pointRepository.deleteById(pointId);
        }

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

        public PointResponse addPoint(PointRequest request) {
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Game game = gameRepository.findById(request.getGameId())
                                .orElseThrow(() -> new RuntimeException("Game not found"));

                int bonus = (request.getCorrectAnswers() == request.getTotalQuestions()) ? 5 : 0;
                int score = request.getScore();

                // Tìm xem đã có bản ghi nào trùng User, Game và tổng điểm này chưa
                Optional<Point> existingPointOpt = pointRepository.findByUserAndGameAndScoreAndBonus(user, game, score,
                                bonus);

                Point point = Point.builder()
                                // Nếu đã tồn tại (isPresent), ta gán ID cũ vào để JPA hiểu là UPDATE thay vì
                                // INSERT
                                .id(existingPointOpt.map(Point::getId).orElse(null))
                                .score(score)
                                .bonus(bonus)
                                .game(game)
                                .correctAnswers(request.getCorrectAnswers())
                                .totalQuestions(request.getTotalQuestions())
                                .createdAt(LocalDateTime.now())
                                .user(user)
                                .build();

                point = pointRepository.save(point);

                // Cập nhật bestScore cho game (giữ nguyên logic của bạn)
                int newScore = point.getScore() + bonus;
                if (newScore > game.getBestScore()) {
                        game.setBestScore(newScore);
                }
                
                // Tăng timesPlayed khi hoàn thành game (tạo point)
                game.setTimesPlayed(game.getTimesPlayed() + 1);
                gameRepository.save(game);
                
                return pointMapper.toResponse(point);
        }

        public UserStatsResponse getUserStats(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

                List<Point> points = pointRepository.findByUser(user);

                // 1. Total Points: Tổng điểm cao nhất của mỗi game (để không bị cộng dồn vô lý)
                int totalPoints = points.stream()
                                .collect(Collectors.groupingBy(p -> p.getGame().getId(),
                                                Collectors.mapping(p -> p.getScore() + p.getBonus(),
                                                                Collectors.maxBy(Integer::compare))))
                                .values().stream()
                                .mapToInt(opt -> opt.orElse(0))
                                .sum();

                // 2. Games Played: Tổng số lượt chơi (tất cả các bản ghi)
                int gamesPlayed = points.size();

                // 3. Highest Score: Điểm cao nhất trong một lượt chơi bất kỳ
                int highestScore = points.stream()
                                .mapToInt(p -> p.getScore() + p.getBonus())
                                .max().orElse(0);

                return UserStatsResponse.builder()
                                .totalPoints(totalPoints)
                                .gamesPlayed(gamesPlayed)
                                .highestScore(highestScore)
                                .build();
        }

}