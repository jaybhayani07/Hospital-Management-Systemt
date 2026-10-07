package org.example.hospital_management.repository;

import org.example.hospital_management.models.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Report findByReportId(String reportId);
    void deleteByReportId(String reportId);
}
