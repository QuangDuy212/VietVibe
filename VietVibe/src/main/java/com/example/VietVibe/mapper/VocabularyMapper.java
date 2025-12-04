package com.example.VietVibe.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.VietVibe.dto.request.VocabularyCreationRequest;
import com.example.VietVibe.dto.request.VocabularyUpdateRequest;
import com.example.VietVibe.dto.response.VocabularyResponse;
import com.example.VietVibe.entity.Vocabulary;

@Mapper(componentModel = "spring")
public interface VocabularyMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    Vocabulary toVocabulary(VocabularyCreationRequest request);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "lessonId", source = "lesson.id")
    VocabularyResponse toVocabularyResponse(Vocabulary vocabulary);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    void updateVocabulary(@MappingTarget Vocabulary vocabulary, VocabularyUpdateRequest request);
}
