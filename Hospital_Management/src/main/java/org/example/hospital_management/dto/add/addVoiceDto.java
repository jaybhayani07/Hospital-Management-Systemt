package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hospital_management.models.Items;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class addVoiceDto {
    private String patientId;
    private String patientName;
    private String doctorName;
    private String date;
    private String status;
    private List<Items> itemsList = new ArrayList<>();
    private String amount;
}
