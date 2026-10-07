package org.example.hospital_management.aiConfig.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.hospital_management.models.ChatAnswer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatAnswer chat(String query) {
        String systemInstruction = "You are a specialized medical assistant and master in all medical concepts for a Hospital Management System. " +
                "Always provide detailed, comprehensive, and easy-to-understand answers. Explain medical concepts clearly. " +
                "Always remind the user to consult a real doctor for serious issues. " +
                "You must respond in valid JSON format exactly matching this structure: { \"reason\": \"string\", \"tips\": \"string\", \"medicines\": \"string\", \"note\": \"string\" }";

        String url = apiKey.startsWith("gsk_") ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        String model = apiKey.startsWith("gsk_") ? "llama3-8b-8192" : "gpt-3.5-turbo";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemInstruction),
                        Map.of("role", "user", "content", query)
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            String content = (String) message.get("content");

            return objectMapper.readValue(content, ChatAnswer.class);
        } catch (Exception e) {
            e.printStackTrace();
            ChatAnswer errorAnswer = new ChatAnswer();
            errorAnswer.setNote("Error communicating with AI service: " + e.getMessage());
            return errorAnswer;
        }
    }
}

