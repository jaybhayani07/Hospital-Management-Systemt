package org.example.hospital_management.services;

import org.example.hospital_management.dto.add.addBedDto;
import org.example.hospital_management.dto.update.updateBedDto;
import org.example.hospital_management.models.Bed;
import org.example.hospital_management.repository.BedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BedService {

    @Autowired
    private BedRepository bedRepository;

    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    public Bed addBed(addBedDto dto) {
        Bed bed = new Bed();
        bed.setBedId("BED" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        bed.setRoom(dto.getRoom());
        bed.setBed(dto.getBed());
        bed.setDepartment(dto.getDepartment());
        bed.setFloor(dto.getFloor());
        bed.setType(dto.getType());
        bed.setStatus(dto.getStatus());
        bed.setPatientId(dto.getPatientId());
        bed.setPatientName(dto.getPatientName());
        if ("occupied".equalsIgnoreCase(dto.getStatus())) {
            bed.setAssignedSince(java.time.LocalDate.now().toString());
        } else {
            bed.setAssignedSince("");
        }
        return bedRepository.save(bed);
    }

    public Bed updateBed(updateBedDto dto) {
        Bed bed = bedRepository.findByBedId(dto.getBedId());
        if (bed != null) {
            bed.setRoom(dto.getRoom());
            bed.setBed(dto.getBed());
            bed.setDepartment(dto.getDepartment());
            bed.setFloor(dto.getFloor());
            bed.setType(dto.getType());
            bed.setStatus(dto.getStatus());
            
            if ("occupied".equalsIgnoreCase(dto.getStatus())) {
                bed.setPatientId(dto.getPatientId());
                bed.setPatientName(dto.getPatientName());
                if (bed.getAssignedSince() == null || bed.getAssignedSince().isEmpty()) {
                    bed.setAssignedSince(java.time.LocalDate.now().toString());
                }
            } else {
                bed.setPatientId("");
                bed.setPatientName("");
                bed.setAssignedSince("");
            }
            return bedRepository.save(bed);
        }
        return null;
    }

    public Bed updateBedStatus(String bedId, String status) {
        Bed bed = bedRepository.findByBedId(bedId);
        if (bed != null) {
            bed.setStatus(status);
            if ("occupied".equalsIgnoreCase(status)) {
                if (bed.getAssignedSince() == null || bed.getAssignedSince().isEmpty()) {
                    bed.setAssignedSince(java.time.LocalDate.now().toString());
                }
            } else {
                bed.setPatientId("");
                bed.setPatientName("");
                bed.setAssignedSince("");
            }
            return bedRepository.save(bed);
        }
        return null;
    }

    public void deleteBed(String bedId) {
        Bed bed = bedRepository.findByBedId(bedId);
        if (bed != null) {
            bedRepository.delete(bed);
        }
    }
}
