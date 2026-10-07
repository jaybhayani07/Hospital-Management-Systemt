package org.example.hospital_management.controllers;

import java.util.List;

import org.example.hospital_management.dto.add.addPatientDto;
import org.example.hospital_management.dto.update.updatePatientDto;
import org.example.hospital_management.dto.update.updatePatientStatusDto;
import org.example.hospital_management.models.Patients;
import org.example.hospital_management.services.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/patient")
@CrossOrigin
public class PatientController {

    private final PatientService  patientService;

    @GetMapping("/allPatient")
    public ResponseEntity<List<Patients>> getAllPatients() {
        return patientService.getAllPatients();
    }

    @PostMapping("/addPatient")
    public ResponseEntity<Patients> addPatient(@RequestBody addPatientDto patient) {
        return patientService.addPatient(patient);
    }

    @PutMapping("/updatePatientStatusById")
    public ResponseEntity<String> updatePatientStatusById(@RequestBody updatePatientStatusDto updatePatientStatusDto) {
        return patientService.updatePatientStatus(updatePatientStatusDto);
    }

    @PutMapping("updatePatientById")
    public ResponseEntity<String> updatePatientById(@RequestBody updatePatientDto patient) {
        return patientService.updatePatientById(patient);
    }
    
}
