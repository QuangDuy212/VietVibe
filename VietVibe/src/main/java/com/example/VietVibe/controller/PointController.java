package com.example.VietVibe.controller;

import com.example.VietVibe.entity.Point;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.jpa.domain.Specification;
import com.example.VietVibe.dto.request.PointRequest;
import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.service.PointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/points")
public class PointController {

    @Autowired
    private PointService pointService;

    @PostMapping
    public ResponseEntity<PointResponse> submitPoint(@RequestBody PointRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pointService.addPoint(request));
    }

    @GetMapping
    public ResponseEntity<ApiPagination<PointResponse>> getAllPoints(@Filter Specification<Point> spec,
            Pageable pageable) {
        return ResponseEntity.ok(pointService.getAllPoints(spec, pageable));
    }

    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Integer> getTotalScore(@PathVariable String userId) {
        return ResponseEntity.ok(pointService.getTotalScore(userId));
    }

    @GetMapping("/user/{userId}/average")
    public ResponseEntity<Double> getAverageScore(@PathVariable String userId) {
        return ResponseEntity.ok(pointService.getAverageScore(userId));
    }

    @GetMapping("/user/{userId}/games")
    public ResponseEntity<Integer> getTotalGames(@PathVariable String userId) {
        return ResponseEntity.ok(pointService.getTotalGames(userId));
    }

    @GetMapping("/user/{username}/history")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public ResponseEntity<List<PointResponse>> getHistory(@PathVariable String username) {
        return ResponseEntity.ok(pointService.getHistory(username));
    }

    @PutMapping("/{pointId}")
    public ResponseEntity<PointResponse> updatePoint(
            @PathVariable Long pointId,
            @RequestBody PointUpdateRequest request) {
        request.setPointId(pointId);
        return ResponseEntity.ok(pointService.updatePoint(request));
    }

    @DeleteMapping("/{pointId}")
    public ResponseEntity<Void> deletePoint(@PathVariable Long pointId) {
        pointService.deletePoint(pointId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/max")
    public ResponseEntity<Integer> getMaxScore() {
        return ResponseEntity.ok(pointService.getMaxScore());
    }

    @GetMapping("/min")
    public ResponseEntity<Integer> getMinScore() {
        return ResponseEntity.ok(pointService.getMinScore());
    }

    @GetMapping("/range/{min}/{max}")
    public ResponseEntity<List<PointResponse>> getPointsByScoreRange(
            @PathVariable int min,
            @PathVariable int max) {
        return ResponseEntity.ok(pointService.getPointsByScoreRange(min, max));
    }

    @DeleteMapping("/user/{userId}/reset")
    public ResponseEntity<Void> resetUserPoints(@PathVariable String userId) {
        pointService.resetUserPoints(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/game/{gameId}/reset")
    public ResponseEntity<Void> resetGamePoints(@PathVariable Long gameId) {
        pointService.resetGamePoints(gameId);
        return ResponseEntity.noContent().build();
    }

    // PAGED search: POST /points/search?page=&size=&sort=
    @PostMapping("/search")
    public ResponseEntity<ApiPagination<PointResponse>> search(@RequestBody PointSearchRequest request,
            @PageableDefault(size = 10) Pageable pageable) {
        Sort effectiveSort = pageable.getSort().isSorted()
                ? pageable.getSort().and(Sort.by(Sort.Direction.DESC, "id"))
                : Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));

        Pageable effectivePageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), effectiveSort);
        return ResponseEntity.ok(pointService.search(request, effectivePageable));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PointResponse>> getMyHistory(Authentication authentication) {
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(pointService.getHistory(currentUserId));
    }
}
