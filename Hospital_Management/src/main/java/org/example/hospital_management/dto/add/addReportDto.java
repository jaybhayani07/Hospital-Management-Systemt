package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hospital_management.models.Parameter;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class addReportDto {
    private String patientId;
    private String patientName;
    private String testType;
    private String orderedBy;
    private String status;
    private String note;
    private List<Parameter> parameters = new ArrayList<>();
}
