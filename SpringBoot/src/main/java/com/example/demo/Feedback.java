package com.example.demo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "pf_feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String comment;

    @Column(name = "instructor_name")
    private String instructorName;

    private String date;

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "reply_comment")
    private String replyComment;
}