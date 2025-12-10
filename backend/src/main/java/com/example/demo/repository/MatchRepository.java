package com.example.demo.repository;

import com.example.demo.model.MatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<MatchHistory, Long> {
    List<MatchHistory> findByUserId(Long userId);
}
