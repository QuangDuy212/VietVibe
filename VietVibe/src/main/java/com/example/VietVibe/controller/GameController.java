package com.example.VietVibe.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.VietVibe.dto.request.GameCreationRequest;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.GameResponse;
import com.example.VietVibe.service.GameService;
import com.example.VietVibe.util.annotation.ApiMessage;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class GameController {
    GameService gameService;

    @PostMapping("/create")
    @ApiMessage("Create a new game success")
    ResponseEntity<GameResponse> createGame(@RequestBody GameCreationRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(this.gameService.create(request));
    }
    
    @DeleteMapping("/delete")
    @ApiMessage("Delete a game success")
    ResponseEntity<ApiString> deleteGame(@PathVariable long id){
        gameService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("Deleted")
                .build());
    } 
}
