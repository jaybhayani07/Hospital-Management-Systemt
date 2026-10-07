package org.example.hospital_management.repository;

import org.example.hospital_management.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Invoice i SET i.status = :status WHERE i.invoiceId = :invoiceId")
    int updateInvoiceStatusById(@Param("invoiceId") String invoiceId, @Param("status") String status);

    Invoice findByInvoiceId(String invoiceId);
}
