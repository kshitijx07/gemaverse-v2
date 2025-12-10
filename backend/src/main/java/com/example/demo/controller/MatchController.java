package com.example.demo.controller;

import com.example.demo.model.MatchHistory;
import com.example.demo.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @GetMapping("/user/{userId}")
    public List<MatchHistory> getUserMatches(@PathVariable Long userId) {
        return matchRepository.findByUserId(userId);
    }

    @PostMapping
    public MatchHistory recordMatch(@RequestBody MatchHistory match) {
        // Logic to update user stats could go here in a service
        return matchRepository.save(match);
    }
}
