package com.example.VietVibe.controller;

import com.example.VietVibe.dto.request.PointRequest;
import com.example.VietVibe.dto.request.PointSearchRequest;
import com.example.VietVibe.dto.request.PointUpdateRequest;
import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.service.PointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/points")
public class PointController {

    @Autowired
    private PointService pointService;

    // Chấm điểm và lưu điểm
    @PostMapping
    public PointResponse submitPoint(@RequestBody PointRequest request) {
        return pointService.addPoint(request);
    }

    //In tất cả point có của website
    @GetMapping
    public List<PointResponse> getAllPoints() {
        return pointService.getAllPoints();
    }
    

    // Tổng điểm của user
    @GetMapping("/user/{userId}/total")
    public int getTotalScore(@PathVariable String userId) {
        return pointService.getTotalScore(userId);
    }

    // Điểm trung bình của user
    @GetMapping("/user/{userId}/average")
    public double getAverageScore(@PathVariable String userId) {
        return pointService.getAverageScore(userId);
    }

    // Số game đã làm của user
    @GetMapping("/user/{userId}/games")
    public int getTotalGames(@PathVariable String userId) {
        return pointService.getTotalGames(userId);
    }

    // Lịch sử làm bài của user
    @GetMapping("/user/{userId}/history")
    public List<PointResponse> getHistory(@PathVariable String userId) {
        return pointService.getHistory(userId);
    }

    // Chỉnh sửa điểm theo id
    @PutMapping("/{pointId}")
    public PointResponse updatePoint(@PathVariable Long pointId, @RequestBody PointUpdateRequest request) {
        request.setPointId(pointId);
        return pointService.updatePoint(request);
    }

    // Xóa điểm theo id
    @DeleteMapping("/{pointId}")
    public void deletePoint(@PathVariable Long pointId) {
        pointService.deletePoint(pointId);
    }

    // Thống kê điểm cao/thấp nhất
    @GetMapping("/max")
    public int getMaxScore() {
        return pointService.getMaxScore();
    }

    @GetMapping("/min")
    public int getMinScore() {
        return pointService.getMinScore();
    }

    // Lọc theo khoảng điểm
    @GetMapping("/range/{min}/{max}")
    public List<PointResponse> getPointsByScoreRange(@PathVariable int min, @PathVariable int max) {
        return pointService.getPointsByScoreRange(min, max);
    }

    // Reset điểm user
    @DeleteMapping("/user/{userId}/reset")
    public void resetUserPoints(@PathVariable String userId) {
        pointService.resetUserPoints(userId);
    }

    // Reset điểm game
    @DeleteMapping("/game/{gameId}/reset")
    public void resetGamePoints(@PathVariable Long gameId) {
        pointService.resetGamePoints(gameId);
    }

    // Tìm kiếm
    @PostMapping("/search")
    public List<PointResponse> search(@RequestBody PointSearchRequest request) {
        return pointService.search(request);
    }
}