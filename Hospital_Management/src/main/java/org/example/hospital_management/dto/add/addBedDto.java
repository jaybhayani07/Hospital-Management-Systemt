package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class addBedDto {
    private int room;
    private String bed;
    private String department;
    private String floor;
    private String type;
    private String status;
    private String patientId;
    private String patientName;
}
