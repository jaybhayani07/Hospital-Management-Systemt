package org.example.hospital_management.dto.update;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class updateInventoryDto {
    private String itemId;
    private String itemName;
    private String category;
    private String quantity;
    private String unit;
    private String reorderLevel;
    private String price;
    private String supplier;
    private String expiryDate;
    private String status;
}
