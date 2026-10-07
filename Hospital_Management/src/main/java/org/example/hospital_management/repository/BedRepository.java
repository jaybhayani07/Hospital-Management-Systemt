package org.example.hospital_management.repository;

import org.example.hospital_management.models.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    Bed findByBedId(String bedId);
    void deleteByBedId(String bedId);

    @Modifying
    @Transactional
    @Query("UPDATE Bed b SET b.status = :status WHERE b.bedId = :bedId")
    int updateBedStatusById(@Param("bedId") String bedId, @Param("status") String status);
}
