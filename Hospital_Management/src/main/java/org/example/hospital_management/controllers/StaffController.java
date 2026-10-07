package org.example.hospital_management.controllers;


import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.atn.SemanticContext;
import org.example.hospital_management.dto.add.addStaffDto;
import org.example.hospital_management.dto.delete.deleteStaffById;
import org.example.hospital_management.dto.update.updateStaffDto;
import org.example.hospital_management.dto.update.updateStaffStatusDto;
import org.example.hospital_management.models.Staff;
import org.example.hospital_management.repository.StaffRepository;
import org.example.hospital_management.services.StaffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin
public class StaffController {

    private final StaffService staffService;

    @GetMapping("/getAllStaff")
    public ResponseEntity<List<Staff>> getAllStaff(){
        return staffService.getAllStaff();
    }

    @PostMapping("/addStaff")
    public ResponseEntity<Staff> addStaff(@RequestBody addStaffDto staff){
        return staffService.addStaff(staff);
    }

    @PutMapping("/updateStaff")
    public ResponseEntity<Staff> updateStaff(@RequestBody updateStaffDto staff){
        return staffService.updateStaff(staff);
    }

    @DeleteMapping("/deleteStaff")
    public void deleteStaff(@RequestBody deleteStaffById staff){
        staffService.deleteStaff(staff.getStaffId());
    }

    @PutMapping("/updateStaffStatus")
    public ResponseEntity<Staff> updateStaffStatus(@RequestBody updateStaffStatusDto staff){
        return staffService.updateStaffStatus(staff);
    }

    @GetMapping("/countTotalStaff")
    public ResponseEntity<Long> countTotalStaff(){
        return staffService.countStaff();
    }

    @GetMapping("/countDoctors")
    public ResponseEntity<Long> countDoctors(){
        return staffService.countDoctors();
    }

    @GetMapping("/countNurses")
    public ResponseEntity<Long> countNurses(){
        return staffService.countNurses();
    }

    @GetMapping("/countOnLeaves")
    public ResponseEntity<Long> countOnLeaves(){
        return staffService.countOnLeave();
    }
}
