package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate template;

    @MessageMapping("/chat/{roomId}/sendMessage")
    public void sendMessageToRoom(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        if ("public".equals(roomId)) {
            template.convertAndSend("/topic/public", chatMessage);
        } else {
            template.convertAndSend("/topic/room/" + roomId, chatMessage);
        }
    }

    @MessageMapping("/chat/{roomId}/addUser")
    public void addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        if ("public".equals(roomId)) {
            template.convertAndSend("/topic/public", chatMessage);
        } else {
            template.convertAndSend("/topic/room/" + roomId, chatMessage);
        }
    }
}
