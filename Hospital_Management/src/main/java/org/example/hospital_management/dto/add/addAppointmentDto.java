package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class addAppointmentDto {

    private String patientId;
    private String patientName;
    private String department;
    private String doctorName;
    private String date;
    private String time;
    private String appointmentType;
    private String note;
}
