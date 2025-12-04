package com.example.VietVibe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.VietVibe.entity.Vocabulary;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, String>, JpaSpecificationExecutor<Vocabulary> {
    boolean existsByWord(String word);

    List<Vocabulary> findByLessonId(String lessonId);
}
