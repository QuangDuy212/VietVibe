package com.example.VietVibe.entity;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.bind.DefaultValue;

import com.example.VietVibe.enums.GameType;
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
@Entity(name = "games")
@JsonPropertyOrder(alphabetic = true)
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("_id")
    long id;

    String name;

    String description;

    int totalQuestion;
    int timesPlayed;

    int bestScore = 0;

    @Enumerated(EnumType.STRING)
    GameType type; //

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    List<Point> points = new ArrayList<>();

}
