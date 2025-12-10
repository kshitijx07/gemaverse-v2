package com.example.demo.controller;

import com.example.demo.model.ChatRoom;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRoomController {

    // Simple In-Memory Storage
    private static final List<ChatRoom> activeRooms = new ArrayList<>();

    // Initialize with a default global room
    static {
        activeRooms.add(new ChatRoom("General Lobby", 100, "System"));
    }

    @GetMapping
    public List<ChatRoom> getRooms() {
        return activeRooms;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody ChatRoom roomRequest) {
        if (roomRequest.getMaxMembers() < 2) {
            return ResponseEntity.badRequest().body("Max members must be at least 2");
        }

        ChatRoom newRoom = new ChatRoom(
                roomRequest.getName(),
                roomRequest.getMaxMembers(),
                roomRequest.getCreatedBy());

        activeRooms.add(newRoom);
        return ResponseEntity.ok(newRoom);
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        Optional<ChatRoom> roomOpt = activeRooms.stream()
                .filter(r -> r.getId().equals(roomId))
                .findFirst();

        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChatRoom room = roomOpt.get();
        boolean joined = room.addMember(username);

        if (!joined) {
            // Check if already member
            if (room.getCurrentMembers() >= room.getMaxMembers()) {
                return ResponseEntity.badRequest().body("Room is full");
            }
            // If addMember returned false but room not full, user probably already in set.
            // We can treat this as success (idempotent).
            return ResponseEntity.ok(room);
        }

        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId,
            @RequestBody java.util.Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        Optional<ChatRoom> roomOpt = activeRooms.stream()
                .filter(r -> r.getId().equals(roomId))
                .findFirst();

        if (roomOpt.isPresent()) {
            roomOpt.get().removeMember(username);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
