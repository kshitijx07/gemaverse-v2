package com.example.demo.controller;

import com.example.demo.model.Game;
import com.example.demo.model.Review;
import com.example.demo.repository.GameRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    @PostMapping("/init")
    public ResponseEntity<?> initGames() {
        if (gameRepository.count() == 0) {
            Game g1 = new Game();
            g1.setTitle("Cyberpunk Arena");
            g1.setGenre("Shooter");
            g1.setRating(4.8);
            g1.setImageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800");
            gameRepository.save(g1);

            Game g2 = new Game();
            g2.setTitle("Neon Racer");
            g2.setGenre("Racing");
            g2.setRating(4.5);
            g2.setImageUrl("https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800");
            gameRepository.save(g2);

            return ResponseEntity.ok(Map.of("message", "Games Initialized"));
        }
        return ResponseEntity.ok(Map.of("message", "Games already exist"));
    }

    @GetMapping("/{gameId}/reviews")
    public List<Review> getGameReviews(@PathVariable Long gameId) {
        return reviewRepository.findByGameId(gameId);
    }

    @PostMapping("/{gameId}/reviews")
    public Review addReview(@PathVariable Long gameId, @RequestBody Review review) {
        review.setGameId(gameId);
        return reviewRepository.save(review);
    }
}
