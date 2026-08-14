package com.example.demo;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "pf_milestones")
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @Column(name = "due_date")
    private String dueDate;

    private String status;
    private int progress;

    @Column(name = "is_approved")
    private Boolean isApproved;
}