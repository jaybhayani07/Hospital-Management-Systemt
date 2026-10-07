package org.example.hospital_management.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatAnswer {
    private String reason;
    private String tips;
    private String medicines;
    private String note;
}
