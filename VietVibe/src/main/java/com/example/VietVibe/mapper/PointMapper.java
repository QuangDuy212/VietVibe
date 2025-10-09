package com.example.VietVibe.mapper;

import com.example.VietVibe.dto.response.PointResponse;
import com.example.VietVibe.entity.Point;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PointMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "gameId", source = "game.id")
    @Mapping(target = "gameType", source = "game.type")
    PointResponse toResponse(Point point);
}