package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class addPatientDto {
    private String name;
    private String age;
    private String gender;
    private String bloodGroup;
    private String email;
    private String phoneNumber;
    private String address;
    private String department;
    private String status;
}
