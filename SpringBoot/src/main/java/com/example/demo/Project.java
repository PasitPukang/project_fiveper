package com.example.demo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "pf_projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String description;
    private String course;

    @Column(name = "due_date")
    private String dueDate;

    private String status;
    private String student;
    private int progress;

    @Column(name = "attachment_url")
    private String attachmentUrl;
}