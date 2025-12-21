package com.example.VietVibe.controller;

import com.example.VietVibe.entity.Point;

import com.turkraft.springfilter.boot.Filter;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.jpa.domain.Specification;
import com.example.VietVibe.dto.request.PointRequest;
import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.dto.response.UserStatsResponse;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.service.PointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/points")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PointController {

    PointService pointService;

    @GetMapping
    public ResponseEntity<ApiPagination<PointResponse>> getAllPoints(@Filter Specification<Point> spec,
            Pageable pageable) {
        return ResponseEntity.ok(pointService.getAllPoints(spec, pageable));
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

    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Integer> getTotalScore(@PathVariable String userId) {
        return ResponseEntity.ok(pointService.getTotalScore(userId));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiPagination<PointResponse>> search(@RequestBody PointSearchRequest request,
            @PageableDefault(size = 10) Pageable pageable) {
        Sort effectiveSort = pageable.getSort().isSorted()
                ? pageable.getSort().and(Sort.by(Sort.Direction.DESC, "id"))
                : Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));

        Pageable effectivePageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), effectiveSort);
        return ResponseEntity.ok(pointService.search(request, effectivePageable));
    }

    @GetMapping("/user/{username}/history")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public ResponseEntity<List<PointResponse>> getHistory(@PathVariable String username) {
        return ResponseEntity.ok(pointService.getHistory(username));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PointResponse>> getMyHistory(Authentication authentication) {
        String currentUserId = authentication.getName();
        return ResponseEntity.ok(pointService.getHistory(currentUserId));
    }


    // Mới: Add point khi chơi xong
    @PostMapping("/add")
    public ResponseEntity<PointResponse> addPoint(@RequestBody PointRequest request) {
        return ResponseEntity.ok(pointService.addPoint(request));
    }

    // Mới: Get user stats
    @GetMapping("/user/{userId}/stats/game")
    public ResponseEntity<UserStatsResponse> getUserStats(@PathVariable String userId) {
        return ResponseEntity.ok(pointService.getUserStats(userId));
    }
}
