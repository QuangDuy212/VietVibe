package com.example.VietVibe.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.VietVibe.dto.request.UserCreationRequest;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.User;


@Mapper(componentModel = "spring")
public interface AuthMapper {
    @Mapping(target = "role", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);
}
