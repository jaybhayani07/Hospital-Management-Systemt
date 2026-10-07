package org.example.hospital_management.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Appointments{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long  id;

    private String appointmentId;

    private String patientId;
    private String patientName;
    private String doctorName;
    private String department;
    private String date;
    private String time;
    private String note;
    private String appointmentType;
    private String status;
}
