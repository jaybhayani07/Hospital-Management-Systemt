package org.example.hospital_management.controllers;

import org.example.hospital_management.dto.add.addBedDto;
import org.example.hospital_management.dto.update.updateBedDto;
import org.example.hospital_management.models.Bed;
import org.example.hospital_management.services.BedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bed")
@CrossOrigin(origins = "http://localhost:5173")
public class BedController {

    @Autowired
    private BedService bedService;

    @GetMapping("/allBeds")
    public List<Bed> getAllBeds() {
        return bedService.getAllBeds();
    }

    @PostMapping("/addBed")
    public ResponseEntity<Bed> addBed(@RequestBody addBedDto dto) {
        return ResponseEntity.ok(bedService.addBed(dto));
    }

    @PutMapping("/updateBed")
    public ResponseEntity<Bed> updateBed(@RequestBody updateBedDto dto) {
        return ResponseEntity.ok(bedService.updateBed(dto));
    }

    @PutMapping("/updateBedStatus")
    public ResponseEntity<Bed> updateBedStatus(@RequestBody updateBedDto dto) {
        return ResponseEntity.ok(bedService.updateBedStatus(dto.getBedId(), dto.getStatus()));
    }

    @DeleteMapping("/deleteBed")
    public ResponseEntity<Void> deleteBed(@RequestBody updateBedDto dto) {
        bedService.deleteBed(dto.getBedId());
        return ResponseEntity.ok().build();
    }
}
