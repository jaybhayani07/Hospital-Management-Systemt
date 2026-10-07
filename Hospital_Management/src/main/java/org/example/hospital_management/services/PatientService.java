package org.example.hospital_management.services;

import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.update.updatePatientDto;
import org.example.hospital_management.dto.update.updatePatientStatusDto;
import org.modelmapper.ModelMapper;
import org.example.hospital_management.dto.add.addPatientDto;
import org.example.hospital_management.models.Patients;
import org.example.hospital_management.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;

    public ResponseEntity<Patients> addPatient(addPatientDto patient) {
        Patients patients = modelMapper.map(patient, Patients.class);

        patients.setAdmissionDate(LocalDateTime.now().toString());
        patients.setHistory(new ArrayList<>());

        Patients saved = patientRepository.save(patients);

        saved.setPatientId(String.format("P%08d",saved.getId()));

        saved =  patientRepository.save(saved);
        return ResponseEntity.ok().body(saved);
    }

    public ResponseEntity<List<Patients>> getAllPatients() {
        return ResponseEntity.ok().body(patientRepository.findAll());
    }

    public ResponseEntity<String> updatePatientStatus(@RequestBody updatePatientStatusDto updatePatientStatusDto) {
        int update = patientRepository.updatePatientStatusById(updatePatientStatusDto.getPatientId(),updatePatientStatusDto.getStatus());

        if(update == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(updatePatientStatusDto.toString());
    }

    public ResponseEntity<String> updatePatientById(updatePatientDto patient) {
        Patients patients = patientRepository.findByPatientId(patient.getPatientId());

        if (patients == null) {
            throw new RuntimeException("Patient not found with ID: " + patient.getPatientId());
        }

        modelMapper.map(patient, patients);
        patientRepository.save(patients);
        return ResponseEntity.ok().body(patients.toString());
    }
}
