package com.example.VietVibe.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.VietVibe.dto.request.LessonCreationRequest;
import com.example.VietVibe.dto.request.LessonUpdateRequest;
import com.example.VietVibe.dto.response.LessonResponse;
import com.example.VietVibe.entity.Lesson;

@Mapper(componentModel = "spring")
public interface LessonMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Lesson toLesson(LessonCreationRequest request);

    @Mapping(target = "_id", source = "id")
    LessonResponse toLessonResponse(Lesson lesson);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateLesson(@MappingTarget Lesson lesson, LessonUpdateRequest request);
}
