package org.example.hospital_management.services;

import org.example.hospital_management.dto.add.addReportDto;
import org.example.hospital_management.dto.update.updateReportDto;
import org.example.hospital_management.models.Report;
import org.example.hospital_management.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report addReport(addReportDto dto) {
        Report report = new Report();
        report.setReportId("LAB" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        report.setPatientId(dto.getPatientId());
        report.setPatientName(dto.getPatientName());
        report.setTestType(dto.getTestType());
        report.setOrderedBy(dto.getOrderedBy());
        report.setDate(java.time.LocalDate.now().toString());
        report.setStatus(dto.getStatus() != null ? dto.getStatus() : "pending");
        report.setNote(dto.getNote() != null ? dto.getNote() : "");
        if (dto.getParameters() != null) {
            report.setParameters(dto.getParameters());
        }
        return reportRepository.save(report);
    }

    public Report updateReport(updateReportDto dto) {
        Report report = reportRepository.findByReportId(dto.getReportId());
        if (report != null) {
            if (dto.getStatus() != null) report.setStatus(dto.getStatus());
            if (dto.getNote() != null) report.setNote(dto.getNote());
            if (dto.getParameters() != null) {
                // Clear existing and add new to avoid detached entity issues or duplicate entries,
                // or just overwrite the collection
                report.getParameters().clear();
                report.getParameters().addAll(dto.getParameters());
            }
            return reportRepository.save(report);
        }
        return null;
    }

    public void deleteReport(String reportId) {
        Report report = reportRepository.findByReportId(reportId);
        if (report != null) {
            reportRepository.delete(report);
        }
    }
}
