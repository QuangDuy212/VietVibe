package com.example.VietVibe.service;

import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.entity.Point;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.mapper.PointMapper;
import com.example.VietVibe.repository.PointRepository;
import com.example.VietVibe.repository.UserRepository;
import com.example.VietVibe.repository.GameRepository;
import com.example.VietVibe.dto.response.ApiPagination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class PointService {

        @Autowired
        private PointRepository pointRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PointMapper pointMapper;

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

}