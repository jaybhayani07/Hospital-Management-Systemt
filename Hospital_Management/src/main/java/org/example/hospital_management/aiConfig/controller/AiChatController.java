package org.example.hospital_management.aiConfig.controller;


import lombok.RequiredArgsConstructor;
import org.example.hospital_management.aiConfig.service.AiChatService;
import org.example.hospital_management.models.ChatAnswer;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<ChatAnswer> chat(@RequestParam("q") String message){
        return ResponseEntity.ok().body(aiChatService.chat(message));
    }
}
