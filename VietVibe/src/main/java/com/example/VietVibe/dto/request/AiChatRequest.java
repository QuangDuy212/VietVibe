package com.example.VietVibe.dto.request;

import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class AiChatRequest {
    private List<Map<String, Object>> history;
}
