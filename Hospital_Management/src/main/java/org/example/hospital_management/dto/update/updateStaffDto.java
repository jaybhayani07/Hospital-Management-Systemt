package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class updateStaffDto {
    private String staffId;
    private String name;
    private String role;
    private String department;
    private String specialization;
    private String email;
    private String phoneNumber;
    private String status;
    private String password;
}
