package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class updatePatientStatusDto {
    private String patientId;
    private String status;
}
