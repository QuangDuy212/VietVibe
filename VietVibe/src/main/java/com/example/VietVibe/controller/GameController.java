package com.example.VietVibe.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.request.GameUpdateRequest;
import com.example.VietVibe.dto.request.UserUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.CountElementResponse;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.Game;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.service.GameService;
import com.example.VietVibe.util.annotation.ApiMessage;
import com.turkraft.springfilter.boot.Filter;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class GameController {
    GameService gameService;

    @GetMapping("/{id}")
    @ApiMessage("Get a game from database")
    ResponseEntity<GameResponse> getGame(@PathVariable("id") long id) {
        return ResponseEntity.ok().body(this.gameService.getGameById(id));
    }

    @GetMapping
    @ApiMessage("Get all games")
    ResponseEntity<ApiPagination<GameResponse>> getGames(@Filter Specification<Game> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.gameService.getAllGames(spec, pageable));
    }

    @PostMapping("/create")
    @ApiMessage("Create a new game success")
    ResponseEntity<GameResponse> createGame(@RequestBody GameCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.gameService.create(request));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a game success")
    ResponseEntity<ApiString> deleteGame(@PathVariable long id) {
        gameService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("Deleted")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a game success")
    ResponseEntity<GameResponse> updateGame(@PathVariable Long id, @RequestBody GameUpdateRequest request) {
        return ResponseEntity.ok().body(this.gameService.updateGame(id, request));
    }

    // Mới: Start play to increment timesPlayed
    @PostMapping("/{id}/play")
    @ApiMessage("Start playing game")
    ResponseEntity<Void> startPlay(@PathVariable Long id) {
        gameService.startPlay(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count/total")
    @ApiMessage("Count games success")
    ResponseEntity<CountElementResponse> countGames() {
        return ResponseEntity.ok().body(this.gameService.countGames());
    }
}
