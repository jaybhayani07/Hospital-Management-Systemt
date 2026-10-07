package org.example.hospital_management.repository;

import org.example.hospital_management.models.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff,Long> {
    Optional<Staff> findByEmail(String email);

    Staff findByStaffId(String id);


    @Query("SELECT COUNT(s) FROM Staff s")
    long countTotalStaff();

    @Query("SELECT COUNT(s) FROM Staff s WHERE s.role = 'Doctor'")
    long countDoctors();

    @Query("SELECT COUNT(s) FROM Staff s WHERE s.role = 'Nurse'")
    long countNurse();

    @Query("SELECT COUNT(s) FROM Staff s WHERE s.status = 'On Leave'")
    long countOnLeaves();

}
