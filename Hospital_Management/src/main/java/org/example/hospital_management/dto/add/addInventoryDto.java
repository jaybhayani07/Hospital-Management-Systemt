package org.example.hospital_management.dto.add;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class addInventoryDto {
    private String itemName;
    private String category;
    private String quantity;
    private String unit;
    private String reorderLevel;
    private String price;
    private String supplier;
    private String expiryDate;
}
