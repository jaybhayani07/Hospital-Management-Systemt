package org.example.hospital_management.controllers;

import org.example.hospital_management.dto.add.addInventoryDto;
import org.example.hospital_management.dto.update.updateInventoryDto;
import org.example.hospital_management.models.Inventory;
import org.example.hospital_management.services.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/allInventory")
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @PostMapping("/addInventory")
    public ResponseEntity<Inventory> addInventory(@RequestBody addInventoryDto dto) {
        return ResponseEntity.ok(inventoryService.addInventory(dto));
    }

    @PutMapping("/updateInventory")
    public ResponseEntity<Inventory> updateInventory(@RequestBody updateInventoryDto dto) {
        return ResponseEntity.ok(inventoryService.updateInventory(dto));
    }

    @DeleteMapping("/deleteInventory")
    public ResponseEntity<Void> deleteInventory(@RequestBody updateInventoryDto dto) {
        inventoryService.deleteInventory(dto.getItemId());
        return ResponseEntity.ok().build();
    }
}
