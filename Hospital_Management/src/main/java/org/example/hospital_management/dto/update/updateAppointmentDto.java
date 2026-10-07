package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class updateAppointmentDto {
    private String appointmentId;
    private String patientName;
    private String patientId;
    private String department;
    private String doctorName;
    private String date;
    private String time;
    private String appointmentType;
    private String note;
    private String status;
}
