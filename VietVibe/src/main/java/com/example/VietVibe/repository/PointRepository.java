package com.example.VietVibe.repository;

import com.example.VietVibe.entity.Point;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PointRepository extends JpaRepository<Point, Long>, JpaSpecificationExecutor<Point> {
    List<Point> findByUser(User user);

    List<Point> findByUserAndGame(User user, Game game);

    List<Point> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<Point> findByScoreBetween(int min, int max);

    void deleteByUser(User user);

    void deleteByGame(Game game);

    long countByGame(Game game);

    Optional<Point> findTopByGameOrderByScoreDesc(Game game);

    Optional<Point> findByUserAndGameAndScoreAndBonus(User user, Game game, int score,
            int bonus);
}