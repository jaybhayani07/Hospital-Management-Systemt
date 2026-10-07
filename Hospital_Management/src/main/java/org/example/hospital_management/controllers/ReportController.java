package org.example.hospital_management.controllers;

import org.example.hospital_management.dto.add.addReportDto;
import org.example.hospital_management.dto.update.updateReportDto;
import org.example.hospital_management.models.Report;
import org.example.hospital_management.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/allReports")
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    @PostMapping("/addReport")
    public ResponseEntity<Report> addReport(@RequestBody addReportDto dto) {
        return ResponseEntity.ok(reportService.addReport(dto));
    }

    @PutMapping("/updateReport")
    public ResponseEntity<Report> updateReport(@RequestBody updateReportDto dto) {
        return ResponseEntity.ok(reportService.updateReport(dto));
    }

    @DeleteMapping("/deleteReport")
    public ResponseEntity<Void> deleteReport(@RequestBody updateReportDto dto) {
        reportService.deleteReport(dto.getReportId());
        return ResponseEntity.ok().build();
    }
}
