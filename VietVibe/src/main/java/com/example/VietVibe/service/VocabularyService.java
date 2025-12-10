package com.example.VietVibe.service;

import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import com.example.VietVibe.dto.request.VocabularyCreationRequest;
import com.example.VietVibe.dto.request.VocabularyUpdateRequest;
import com.example.VietVibe.dto.response.VocabularyResponse;
import com.example.VietVibe.entity.Lesson;
import com.example.VietVibe.entity.Vocabulary;
import com.example.VietVibe.exception.AppException;
import com.example.VietVibe.exception.ErrorCode;
import com.example.VietVibe.mapper.VocabularyMapper;
import com.example.VietVibe.repository.LessonRepository;
import com.example.VietVibe.repository.VocabularyRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyService {
    VocabularyRepository vocabularyRepository;
    VocabularyMapper vocabularyMapper;
    LessonRepository lessonRepository;

    public VocabularyResponse create(VocabularyCreationRequest request) {
        log.info("Create a vocabulary");
        if (vocabularyRepository.existsByWord(request.getWord())) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        Vocabulary vocabulary = vocabularyMapper.toVocabulary(request);

        if (request.getLessonId() != null && !request.getLessonId().isEmpty()) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            vocabulary.setLesson(lesson);
        }

        vocabulary = vocabularyRepository.save(vocabulary);
        return vocabularyMapper.toVocabularyResponse(vocabulary);
    }

    @Transactional
    public List<VocabularyResponse> create(List<VocabularyCreationRequest> requests) {
        log.info("Create vocabularies batch");
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        // check duplicate words inside the request batch
        // List<String> words = requests.stream().map(r -> r.getWord().trim()).collect(Collectors.toList());
        // long distinctCount = words.stream().distinct().count();
        // if (distinctCount != words.size()) {
        //     throw new AppException(ErrorCode.CATEGORY_EXISTED);
        // }

        // check existing words in DB
        // for (String w : words) {
        //     if (vocabularyRepository.existsByWord(w)) {
        //         throw new AppException(ErrorCode.CATEGORY_EXISTED);
        //     }
        // }

        List<Vocabulary> toSave = requests.stream(). map(req -> {
            Vocabulary v = vocabularyMapper.toVocabulary(req);
            if (req.getLessonId() != null && !req.getLessonId().isEmpty()) {
                Lesson lesson = lessonRepository.findById(req.getLessonId())
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
                v.setLesson(lesson);
            }
            return v;
        }).collect(Collectors.toList());

        List<Vocabulary> saved = vocabularyRepository.saveAll(toSave);

        return saved.stream().map(vocabularyMapper::toVocabularyResponse).collect(Collectors.toList());
    }

    public VocabularyResponse getDetailVocabulary(String id) {
        log.info("Get detail vocabulary");
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return vocabularyMapper.toVocabularyResponse(vocabulary);
    }

    public VocabularyResponse update(String id, VocabularyUpdateRequest request) {
        log.info("Update vocabulary");
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getWord() != null && !request.getWord().equals(vocabulary.getWord())) {
            if (vocabularyRepository.existsByWord(request.getWord())) {
                throw new AppException(ErrorCode.CATEGORY_EXISTED);
            }
        }

        if (request.getLessonId() != null && !request.getLessonId().isEmpty()) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            vocabulary.setLesson(lesson);
        }

        vocabularyMapper.updateVocabulary(vocabulary, request);
        return vocabularyMapper.toVocabularyResponse(vocabularyRepository.save(vocabulary));
    }

    public void delete(String id) {
        log.info("Delete vocabulary");
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        vocabularyRepository.delete(vocabulary);
    }

    public List<VocabularyResponse> getAllVocabularies() {
        log.info("Get all vocabularies (no paging)");
        List<Vocabulary> list = vocabularyRepository.findAll();
        return list.stream().map(vocabularyMapper::toVocabularyResponse).toList();
    }

    public List<VocabularyResponse> getVocabulariesByLessonId(String lessonId) {
        log.info("Get vocabularies by lesson id");
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        List<Vocabulary> list = vocabularyRepository.findByLessonId(lessonId);
        return list.stream().map(vocabularyMapper::toVocabularyResponse).toList();
    }
}
