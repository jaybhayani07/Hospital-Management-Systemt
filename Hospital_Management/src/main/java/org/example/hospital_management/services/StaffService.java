package org.example.hospital_management.services;


import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.add.addStaffDto;
import org.example.hospital_management.dto.update.updateStaffDto;
import org.example.hospital_management.dto.update.updateStaffStatusDto;
import org.example.hospital_management.models.Staff;
import org.example.hospital_management.repository.PatientRepository;
import org.example.hospital_management.repository.StaffRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public ResponseEntity<List<Staff>> getAllStaff(){
        return ResponseEntity.ok().body(staffRepository.findAll());
    }

    public ResponseEntity<Staff> addStaff(addStaffDto addStaffDto){
        Staff staff = modelMapper.map(addStaffDto,Staff.class);
        
        if (addStaffDto.getPassword() != null && !addStaffDto.getPassword().isEmpty()) {
            staff.setPassword(passwordEncoder.encode(addStaffDto.getPassword()));
        }

        Staff savedStaff = staffRepository.save(staff);

        savedStaff.setStaffId(String.format("S%08d",savedStaff.getId()));

        staffRepository.save(savedStaff);
        return ResponseEntity.ok().body(savedStaff);
    }

    public ResponseEntity<Staff> updateStaff(updateStaffDto staff){
       Staff staff1 = staffRepository.findByStaffId(staff.getStaffId());

       if(staff1 == null){
           return ResponseEntity.notFound().build();
       }
       
       String existingPassword = staff1.getPassword();

       modelMapper.map(staff,staff1);
       
       if (staff.getPassword() != null && !staff.getPassword().isEmpty()) {
           staff1.setPassword(passwordEncoder.encode(staff.getPassword()));
       } else {
           staff1.setPassword(existingPassword);
       }
       
       Staff savedStaff = staffRepository.save(staff1);

       return ResponseEntity.ok().body(savedStaff);
    }

    public void deleteStaff(String staffId){
        Staff staff = staffRepository.findByStaffId(staffId);

        staffRepository.delete(staff);
    }

    public ResponseEntity<Staff> updateStaffStatus(updateStaffStatusDto staffStatusDto){
        Staff staff = staffRepository.findByStaffId(staffStatusDto.getStaffId());

        staff.setStatus(staffStatusDto.getStatus());

        staffRepository.save(staff);
        return ResponseEntity.ok().body(staff);
    }

    public ResponseEntity<Long> countStaff(){
        return ResponseEntity.ok().body(staffRepository.count());
    }

    public ResponseEntity<Long> countOnLeave(){
        return ResponseEntity.ok().body(staffRepository.countOnLeaves());
    }

    public ResponseEntity<Long> countNurses(){
        return ResponseEntity.ok().body(staffRepository.countNurse());
    }

    public ResponseEntity<Long> countDoctors(){
        return ResponseEntity.ok().body(staffRepository.countDoctors());
    }
}
