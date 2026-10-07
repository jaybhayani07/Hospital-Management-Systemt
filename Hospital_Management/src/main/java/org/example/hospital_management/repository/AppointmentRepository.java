package org.example.hospital_management.repository;

import org.example.hospital_management.models.Appointments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface AppointmentRepository extends JpaRepository<Appointments, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Appointments a SET a.status = :status WHERE a.appointmentId = :appointmentId")
    int updateAppointmentStatus(@Param("appointmentId")  String appointmentId, @Param("status") String status);

    @Query("SELECT COUNT(a) FROM Appointments a WHERE a.status = 'Scheduled'")
    long countOfScheduled();

    @Query("SELECT COUNT(a) FROM Appointments a WHERE a.status = 'Completed'")
    long countOfCompleted();

    @Query("SELECT COUNT(a) FROM Appointments a WHERE a.status = 'Cancelled'")
    long countOfCancelled();

    @Query("SELECT COUNT(a) FROM Appointments a WHERE a.date = :date")
    long countTodayAppointments(@Param("date") String date);

    Appointments findByAppointmentId(String id);
}
