package org.example.hospital_management.repository;

import org.example.hospital_management.models.Patients;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PatientRepository extends JpaRepository<Patients, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Patients p SET p.status = :status WHERE p.patientId = :patientId")
    int updatePatientStatusById(@Param("patientId") String patientId, @Param("status") String status);

    Patients findByPatientId(String patientId);
}
