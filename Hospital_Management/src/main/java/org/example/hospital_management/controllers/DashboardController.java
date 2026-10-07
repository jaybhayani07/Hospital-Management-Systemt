package org.example.hospital_management.controllers;

import org.example.hospital_management.dto.dashboard.DepartmentStatDto;
import org.example.hospital_management.dto.dashboard.MonthlyRevenueDto;
import org.example.hospital_management.dto.dashboard.WeeklyAppointmentDto;
import org.example.hospital_management.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/weeklyAppointments")
    public ResponseEntity<List<WeeklyAppointmentDto>> getWeeklyAppointments() {
        return ResponseEntity.ok(dashboardService.getWeeklyAppointments());
    }

    @GetMapping("/departmentStats")
    public ResponseEntity<List<DepartmentStatDto>> getDepartmentStats() {
        return ResponseEntity.ok(dashboardService.getDepartmentStats());
    }

    @GetMapping("/monthlyRevenue")
    public ResponseEntity<List<MonthlyRevenueDto>> getMonthlyRevenue() {
        return ResponseEntity.ok(dashboardService.getMonthlyRevenue());
    }
}
