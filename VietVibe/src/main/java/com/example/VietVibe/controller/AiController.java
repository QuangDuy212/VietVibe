package com.example.VietVibe.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.example.VietVibe.dto.request.AiChatRequest;
import com.example.VietVibe.dto.request.AiGenerateRequest;
import com.example.VietVibe.service.AiService;
import com.example.VietVibe.util.annotation.ApiMessage;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-questions")
    @ApiMessage("Generated questions successfully using Google Gemini AI")
    public ResponseEntity<Object> generateQuestions(@RequestBody AiGenerateRequest request) {
        Object generated = this.aiService.generateQuestions(request);
        return ResponseEntity.ok().body(generated);
    }

    @PostMapping("/chat")
    @ApiMessage("Chatbot reply generated successfully")
    public ResponseEntity<Object> chat(@RequestBody AiChatRequest request) {
        String reply = this.aiService.chatWithAi(request.getHistory());
        return ResponseEntity.ok().body(Map.of("reply", reply));
    }
}
