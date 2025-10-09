package com.example.VietVibe.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
@Entity(name = "answers")
@JsonPropertyOrder(alphabetic = true)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("_id")
    private Long id;

    private String content;   // Nội dung đáp án
    
    private boolean isCorrect; // Có phải đáp án đúng không (Chọn đáp án đúng và nghe)
    private Integer orderIndex; // Thứ tự câu (Sắp xếp câu)

    @ManyToOne
    @JoinColumn(name = "question_id")
    @JsonBackReference
    Question question;
}
