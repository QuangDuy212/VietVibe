package com.example.VietVibe.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.VietVibe.dto.request.LessonDetailCreationRequest;
import com.example.VietVibe.dto.request.LessonDetailUpdateRequest;
import com.example.VietVibe.dto.response.LessonDetailResponse;
import com.example.VietVibe.entity.LessonDetail;

@Mapper(componentModel = "spring")
public interface LessonDetailMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "gramma", source = "gramma")
    @Mapping(target = "vocab", source = "vocab")
    @Mapping(target = "phonetic", source = "phonetic")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    LessonDetail toLessonDetail(LessonDetailCreationRequest request);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "lessonId", source = "lesson.id")
    @Mapping(target = "gramma", source = "gramma")
    @Mapping(target = "vocab", source = "vocab")
    @Mapping(target = "phonetic", source = "phonetic")
    LessonDetailResponse toLessonDetailResponse(LessonDetail lessonDetail);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "gramma", source = "gramma")
    @Mapping(target = "vocab", source = "vocab")
    @Mapping(target = "phonetic", source = "phonetic")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lesson", ignore = true)
    void updateLessonDetail(@MappingTarget LessonDetail lessonDetail, LessonDetailUpdateRequest request);
}

