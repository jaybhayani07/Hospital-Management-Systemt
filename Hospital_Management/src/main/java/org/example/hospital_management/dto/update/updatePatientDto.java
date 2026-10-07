package org.example.hospital_management.dto.update;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class updatePatientDto {
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
}
