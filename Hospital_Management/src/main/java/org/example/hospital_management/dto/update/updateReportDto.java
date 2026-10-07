package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hospital_management.models.Parameter;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class updateReportDto {
    private String reportId;
    private String status;
    private List<Parameter> parameters = new ArrayList<>();
    private String note;
}
