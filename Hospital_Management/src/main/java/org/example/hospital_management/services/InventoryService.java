package org.example.hospital_management.services;

import org.example.hospital_management.dto.add.addInventoryDto;
import org.example.hospital_management.dto.update.updateInventoryDto;
import org.example.hospital_management.models.Inventory;
import org.example.hospital_management.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory addInventory(addInventoryDto dto) {
        Inventory inventory = new Inventory();
        inventory.setItemId("INV" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        inventory.setItemName(dto.getItemName());
        inventory.setCategory(dto.getCategory());
        inventory.setQuantity(dto.getQuantity());
        inventory.setUnit(dto.getUnit());
        inventory.setReorderLevel(dto.getReorderLevel());
        inventory.setPrice(dto.getPrice());
        inventory.setSupplier(dto.getSupplier());
        inventory.setExpiryDate(dto.getExpiryDate());
        inventory.setStatus("In Stock");
        return inventoryRepository.save(inventory);
    }

    public Inventory updateInventory(updateInventoryDto dto) {
        Inventory inventory = inventoryRepository.findByItemId(dto.getItemId());
        if (inventory != null) {
            if (dto.getItemName() != null) inventory.setItemName(dto.getItemName());
            if (dto.getCategory() != null) inventory.setCategory(dto.getCategory());
            if (dto.getQuantity() != null) inventory.setQuantity(dto.getQuantity());
            if (dto.getUnit() != null) inventory.setUnit(dto.getUnit());
            if (dto.getReorderLevel() != null) inventory.setReorderLevel(dto.getReorderLevel());
            if (dto.getPrice() != null) inventory.setPrice(dto.getPrice());
            if (dto.getSupplier() != null) inventory.setSupplier(dto.getSupplier());
            if (dto.getExpiryDate() != null) inventory.setExpiryDate(dto.getExpiryDate());
            if (dto.getStatus() != null) inventory.setStatus(dto.getStatus());
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    public void deleteInventory(String itemId) {
        Inventory inventory = inventoryRepository.findByItemId(itemId);
        if(inventory != null) {
            inventoryRepository.delete(inventory);
        }
    }
}
