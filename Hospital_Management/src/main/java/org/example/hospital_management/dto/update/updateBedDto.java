package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class updateBedDto {

    private String bedId;
    private int room;
    private String bed;
    private String department;
    private String floor;
    private String type;
    private String status;

    private String patientId;
    private String patientName;
}
