package org.example.hospital_management.repository;

import org.example.hospital_management.models.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Inventory findByItemId(String itemId);
    void deleteByItemId(String itemId);
}
