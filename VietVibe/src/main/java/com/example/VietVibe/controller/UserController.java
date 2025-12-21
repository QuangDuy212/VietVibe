package com.example.VietVibe.controller;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.VietVibe.dto.request.UserCreationRequest;
import com.example.VietVibe.dto.request.UserUpdateRequest;
import com.example.VietVibe.dto.response.ApiPagination;
import com.example.VietVibe.dto.response.ApiString;
import com.example.VietVibe.dto.response.CountElementResponse;
import com.example.VietVibe.dto.response.UserResponse;
import com.example.VietVibe.entity.User;
import com.example.VietVibe.service.UserService;
import com.example.VietVibe.util.annotation.ApiMessage;
import com.example.VietVibe.util.annotation.PublicEndpoint;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    @PublicEndpoint
    @PostMapping
    @ApiMessage("Create a user success")
    ResponseEntity<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all users success")
    ResponseEntity<ApiPagination<UserResponse>> getUsers(@Filter Specification<User> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.userService.getAllUsers(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail user success")
    ResponseEntity<UserResponse> getUser(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.userService.getDetailUser(id));
    }

    @GetMapping("/my-info")
    @ApiMessage("Get my infor success")
    ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok().body(this.userService.getMyInfo());
    }

    @GetMapping("/count/total")
    @ApiMessage("Count all users success")
    ResponseEntity<CountElementResponse> countAllUsers() {
        return ResponseEntity.ok().body(this.userService.countAllUsers());
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a user success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a user success")
    ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok().body(this.userService.update(id, request));
    }

    @PostMapping("/search")
    @ApiMessage("Search users success")
    ResponseEntity<ApiPagination<UserResponse>> searchUsers(
            @RequestBody Map<String, String> request,
            @PageableDefault(size = 10) Pageable pageable) {
        String keyword = request != null ? request.get("keyword") : null;
        return ResponseEntity.ok().body(this.userService.search(keyword, pageable));
    }
}

