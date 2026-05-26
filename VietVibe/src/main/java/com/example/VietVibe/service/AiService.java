package com.example.VietVibe.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.VietVibe.dto.request.AiGenerateRequest;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public Object generateQuestions(AiGenerateRequest request) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("AIzaSyFakeKey")) {
            throw new RuntimeException("Google Gemini API Key is not configured on the server! Please set the GEMINI_API_KEY environment variable or property.");
        }

        String gameType = request.getGameType();
        String typeInstructions = "";

        if ("MULTIPLE_CHOICE".equalsIgnoreCase(gameType)) {
            typeInstructions = "\n" +
                    "The game type is MULTIPLE_CHOICE.\n" +
                    "Generate a JSON array of questions, where each question must strictly follow this TypeScript structure:\n" +
                    "interface GeneratedQuestion {\n" +
                    "  content: string; // The question text written in ENGLISH (e.g. \"What is the Vietnamese word for 'apple'?\" or \"What does the phrase 'Xin chào' mean in English?\")\n" +
                    "  answers: {\n" +
                    "    content: string; // Choice content. If the question asks for the Vietnamese translation, choices must be in Vietnamese. If the question asks for the English meaning of a Vietnamese phrase, choices must be in English.\n" +
                    "    isCorrect: boolean; // Must be true for exactly one choice, false for the others\n" +
                    "  }[];\n" +
                    "}\n" +
                    "Ensure there are exactly 4 choices per question. Ensure exactly one choice is marked isCorrect: true. " +
                    "CRITICAL FOR DIFFICULTY: You must randomly shuffle/scramble the order of the choices in the 'answers' array so that the correct answer (isCorrect: true) is placed at a random index (sometimes first, sometimes second, third, or fourth). Never put the correct answer always in the first position!\n";
        } else if ("SENTENCE_ORDER".equalsIgnoreCase(gameType)) {
            typeInstructions = "\n" +
                    "The game type is SENTENCE_ORDER.\n" +
                    "Generate a JSON array of questions, where each question must strictly follow this TypeScript structure:\n" +
                    "interface GeneratedQuestion {\n" +
                    "  content: string; // Instruction text written in ENGLISH telling the user which Vietnamese sentence to build (e.g. \"Arrange the words to say: 'I speak Vietnamese'\" or \"Translate and arrange the words for: 'This food is delicious'\")\n" +
                    "  answers: {\n" +
                    "    content: string; // A word or phrase part of the VIETNAMESE sentence (e.g. \"Tôi\", \"nói\", \"tiếng\", \"Việt\")\n" +
                    "    orderIndex: number; // The correct 0-indexed position of this Vietnamese part in the full sentence\n" +
                    "  }[];\n" +
                    "}\n" +
                    "Ensure there are 3 to 6 parts per sentence, and orderIndex values are sequential (0, 1, 2...).\n" +
                    "CRITICAL FOR DIFFICULTY: You MUST randomly shuffle/scramble the order of the word parts inside the 'answers' array in your generated JSON so that they are NOT in sequential order of their 'orderIndex'. For example, never output the choices in the order of 0, 1, 2, 3... in the JSON list. Instead, output them in a completely scrambled order in the array (e.g., index 2 first, then 0, then 3, then 1), while still keeping their correct 'orderIndex' integers intact!\n";
        } else if ("LISTENING_CHOICE".equalsIgnoreCase(gameType)) {
            typeInstructions = "\n" +
                    "The game type is LISTENING_CHOICE.\n" +
                    "Generate a JSON array of questions, where each question must strictly follow this TypeScript structure:\n" +
                    "interface GeneratedQuestion {\n" +
                    "  content: string; // Question text written in ENGLISH asking to identify, transcribe, or translate the VIETNAMESE audio clip (e.g. \"Which phrase did you hear in the audio?\" or \"What does the speaker say in the audio?\")\n" +
                    "  audioUrl: string; // Recommend a public audio file URL or placeholder, e.g. \"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3\"\n" +
                    "  answers: {\n" +
                    "    content: string; // Choice content (either Vietnamese transcription options or English translations, matching the English question)\n" +
                    "    isCorrect: boolean; // Exactly one choice is correct\n" +
                    "  }[];\n" +
                    "}\n" +
                    "Ensure exactly 3 or 4 choices per question.\n" +
                    "CRITICAL FOR DIFFICULTY: You must randomly shuffle/scramble the order of the choices in the 'answers' array so that the correct answer (isCorrect: true) is placed at a random index. Never put the correct answer always in the first position!\n";
        }

        String promptText = String.format(
                "You are an expert AI Language game designer for the VietVibe Vietnamese Language Learning Platform.\n" +
                "Your target audience is English speakers who are learning Vietnamese as a foreign language.\n" +
                "Therefore, all question texts, prompts, and instruction instructions must be written in ENGLISH, while asking the student about VIETNAMESE language, vocabulary, grammar, translation, and pronunciation.\n\n" +
                "Your task is to generate high-quality educational learning questions for the topic/theme: \"%s\".\n" +
                "Difficulty level: %s.\n" +
                "Generate exactly %d questions.\n\n" +
                "Instructions:\n" +
                "1. All Vietnamese text inside the answers or questions must be natural, standard, grammatically correct, and culturally appropriate.\n" +
                "2. All question text and instruction text (in 'content' field) must be written in ENGLISH.\n" +
                "3. Return ONLY a valid JSON array matching the structure below. Do not wrap the JSON in HTML tags, do not include markdown backticks (no ```json blocks), and do not include extra explanations.\n" +
                "4. Keep the content engaging, modern, and helpful for language students.\n" +
                "%s",
                request.getPrompt().trim(),
                request.getLevel(),
                request.getCount(),
                typeInstructions
        );

        try {
            // Build the standard Gemini REST payload map
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", promptText);

            Map<String, Object> partsObj = new HashMap<>();
            partsObj.put("parts", Collections.singletonList(textPart));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(partsObj));
            requestBody.put("generationConfig", generationConfig);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Fallback model chain to bypass quota limits (limit: 0) or temporary 503 traffic overloads
            List<String> modelsToTry = List.of("gemini-2.5-flash", "gemini-3.5-flash");
            Exception lastException = null;
            String text = null;

            for (String modelName : modelsToTry) {
                try {
                    String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + geminiApiKey;
                    System.out.println("Trying to generate AI questions using model: " + modelName);

                    ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                    Map<String, Object> body = response.getBody();
                    if (body == null) {
                        throw new RuntimeException("Empty response body returned from Gemini API");
                    }

                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (candidates == null || candidates.isEmpty()) {
                        throw new RuntimeException("No candidates returned from Gemini API");
                    }

                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                    if (contentMap == null) {
                        throw new RuntimeException("Empty content map in candidate");
                    }

                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    if (parts == null || parts.isEmpty()) {
                        throw new RuntimeException("No parts returned in content map");
                    }

                    text = (String) parts.get(0).get("text");
                    if (text == null) {
                        throw new RuntimeException("Null response text from parts");
                    }

                    System.out.println("Successfully generated questions using model: " + modelName);
                    break; // Succeeded! Break out of the loop
                } catch (Exception e) {
                    System.err.println("Model " + modelName + " failed: " + e.getMessage());
                    lastException = e;
                }
            }

            if (text == null) {
                throw new RuntimeException("All Gemini models failed. Last error: " + (lastException != null ? lastException.getMessage() : "Unknown"), lastException);
            }

            // Cleanup potential markdown wrapper blocks
            System.out.println("=== GEMINI RAW TEXT ===");
            System.out.println(text);
            System.out.println("=======================");

            String cleanedText = text.trim();
            if (cleanedText.startsWith("```")) {
                cleanedText = cleanedText.replaceAll("^```(?:json)?\\s*", "").replaceAll("```$", "");
            }
            cleanedText = cleanedText.trim();

            System.out.println("=== GEMINI CLEANED JSON ===");
            System.out.println(cleanedText);
            System.out.println("===========================");

            ObjectMapper mapper = new ObjectMapper();
            Object parsedObj = mapper.readValue(cleanedText, Object.class);

            // Auto-unpack if Gemini wrapped the array in an object like {"questions": [...]} or similar
            Object finalObj = parsedObj;
            if (parsedObj instanceof Map) {
                Map<?, ?> map = (Map<?, ?>) parsedObj;
                for (Object val : map.values()) {
                    if (val instanceof List) {
                        System.out.println("Auto-unpacked nested list from Gemini object response.");
                        finalObj = val;
                        break;
                    }
                }
            }

            // If it is a SENTENCE_ORDER game, shuffle the answers array for each question to scramble their display positions!
            if ("SENTENCE_ORDER".equalsIgnoreCase(gameType) && finalObj instanceof List) {
                try {
                    List<Map<String, Object>> questionList = (List<Map<String, Object>>) finalObj;
                    for (Map<String, Object> question : questionList) {
                        Object answersObj = question.get("answers");
                        if (answersObj instanceof List) {
                            List<?> answersList = (List<?>) answersObj;
                            Collections.shuffle(answersList);
                        }
                    }
                    System.out.println("Successfully scrambled answer options for SENTENCE_ORDER game.");
                } catch (Exception e) {
                    System.err.println("Failed to scramble answers list: " + e.getMessage());
                }
            }

            return finalObj;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI questions: " + e.getMessage(), e);
        }
    }
}
