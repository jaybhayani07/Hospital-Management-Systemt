package org.example.hospital_management.controllers;


import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.add.addAppointmentDto;
import org.example.hospital_management.dto.update.updateAppointmentDto;
import org.example.hospital_management.dto.update.updateAppointmentStatusDto;
import org.example.hospital_management.models.Appointments;
import org.example.hospital_management.services.AppointmentService;
import org.modelmapper.PropertyMap;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.modelmapper.PropertyMap;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appointment")
@CrossOrigin
public class AppointmentController {


    private final AppointmentService appointmentService;

    @GetMapping("/allAppointments")
    public ResponseEntity<List<Appointments>> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping("/addAppointment")
    public ResponseEntity<Appointments> addAppointment(@RequestBody addAppointmentDto appointment) {
        return appointmentService.addAppointment(appointment);
    }

    @PutMapping("/updateAppointment")
    public ResponseEntity<Appointments> updateAppointment(@RequestBody updateAppointmentDto appointment) {
        return appointmentService.updateAppointment(appointment);
    }

    @PutMapping("/updateAppointmentStatus")
    public ResponseEntity<updateAppointmentStatusDto> updateAppointmentStatus(@RequestBody updateAppointmentStatusDto appointment) {
        return appointmentService.updateAppointmentStatus(appointment);
    }

    @GetMapping("/countScheduled")
    public ResponseEntity<Long> countScheduledAppointments() {
        return appointmentService.countScheduledAppointments();
    }

    @GetMapping("/countCompleted")
    public ResponseEntity<Long> countCompletedAppointments() {
        return appointmentService.countCompletedAppointments();
    }

    @GetMapping("/countCancelled")
    public ResponseEntity<Long> countCancelledAppointments() {
        return appointmentService.countCancelledAppointments();
    }

    @GetMapping("/countToday")
    public ResponseEntity<Long> countTodayAppointments(@RequestParam(value = "date", required = false) String date) {
        if (date == null || date.isEmpty()) {
            date = java.time.LocalDate.now().toString();
        }
        return appointmentService.countTodayAppointments(date);
    }
}
