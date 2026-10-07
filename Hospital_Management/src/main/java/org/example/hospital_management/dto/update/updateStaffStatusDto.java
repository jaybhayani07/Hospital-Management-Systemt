package org.example.hospital_management.dto.update;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class updateStaffStatusDto {
    private String staffId;
    private String status;
}
