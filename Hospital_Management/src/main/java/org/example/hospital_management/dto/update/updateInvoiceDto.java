package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hospital_management.models.Items;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class updateInvoiceDto {
    private String invoiceId;
    private String patientName;
    private String status;
    private String amount;
    private List<Items> itemsList = new ArrayList<>();
}
