package org.example.hospital_management.services;

import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.add.addAppointmentDto;
import org.example.hospital_management.dto.update.updateAppointmentDto;
import org.example.hospital_management.dto.update.updateAppointmentStatusDto;
import org.example.hospital_management.models.Appointments;
import org.example.hospital_management.repository.AppointmentRepository;
import org.example.hospital_management.repository.PatientRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
@RequiredArgsConstructor

public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ModelMapper modelMapper;

    public ResponseEntity<List<Appointments>> getAllAppointments() {
        return ResponseEntity.ok().body(appointmentRepository.findAll());
    }

    public ResponseEntity<Appointments> addAppointment(addAppointmentDto appointments) {
        Appointments appointments1 =modelMapper.map(appointments, Appointments.class);

        Appointments appointments2 = appointmentRepository.save(appointments1);

        appointments2.setAppointmentId(String.format("APT%08d", appointments2.getId()));

        appointments2 = appointmentRepository.save(appointments2);

        return ResponseEntity.ok().body(appointments2);
    }

    public ResponseEntity<Appointments> updateAppointment(updateAppointmentDto appointment) {
        Appointments appointments1 = appointmentRepository.findByAppointmentId(appointment.getAppointmentId());

        if(appointments1 == null){
            return ResponseEntity.notFound().build();
        }

        modelMapper.map(appointment,appointments1);
        Appointments appointments2 = appointmentRepository.save(appointments1);
        return ResponseEntity.ok().body(appointments2);
    }

    public ResponseEntity<updateAppointmentStatusDto> updateAppointmentStatus(updateAppointmentStatusDto statusDto) {
        int update =  appointmentRepository.updateAppointmentStatus(statusDto.getAppointmentId(), statusDto.getStatus());

        if(update == 0){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(statusDto);
    }

    public ResponseEntity<Long> countScheduledAppointments() {
        return ResponseEntity.ok().body(appointmentRepository.countOfScheduled());
    }

    public ResponseEntity<Long> countCompletedAppointments() {
        return ResponseEntity.ok().body(appointmentRepository.countOfCompleted());
    }

    public ResponseEntity<Long> countCancelledAppointments() {
        return ResponseEntity.ok().body(appointmentRepository.countOfCancelled());
    }

    public ResponseEntity<Long> countTodayAppointments(String date) {
        return ResponseEntity.ok().body(appointmentRepository.countTodayAppointments(date));
    }
}
