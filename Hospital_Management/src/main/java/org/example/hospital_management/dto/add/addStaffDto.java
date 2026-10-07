package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class addStaffDto {
    private String name;
    private String role;
    private String department;
    private String specialization;
    private String email;
    private String phoneNumber;
    private String password;
}
