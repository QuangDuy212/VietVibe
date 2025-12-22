package com.example.VietVibe.entity;

import java.security.Permission;
import java.time.Instant;
import java.util.List;

import com.example.VietVibe.enums.GameType;
import com.example.VietVibe.enums.LessonLevel;
import com.example.VietVibe.util.SecurityUtil;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "lessons")
@JsonPropertyOrder(alphabetic = true)
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(name = "lessontitle", unique = true, length = 255, nullable = false)
    String lessontitle;
    String videourl;
    String description;

    Instant createdAt;
    Instant updatedAt;
    String createdBy;
    String updatedBy;
    String time;
    int durationSeconds;
    @Enumerated(EnumType.STRING)
    LessonLevel level;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    List<UserLesson> userLessons;

    @JsonManagedReference
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vocabulary> vocabularies;

    @OneToOne(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LessonDetail lessonDetail;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() == true
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.updatedAt = Instant.now();
    }

}
