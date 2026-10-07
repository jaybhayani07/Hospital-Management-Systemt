package org.example.hospital_management.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Patients {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String patientId;
    private String name;
    private int age;
    private String gender;
    private String bloodGroup;
    private String department;
    private String status;
    private String email;
    private String phoneNumber;
    private String address;
    private String admissionDate;
    private String diagnosis;
    private String assignedDoctor;
    private List<String> history;
}
