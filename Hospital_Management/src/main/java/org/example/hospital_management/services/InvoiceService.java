package org.example.hospital_management.services;

import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.add.addVoiceDto;
import org.example.hospital_management.dto.update.updateInvoiceDto;
import org.example.hospital_management.models.Invoice;
import org.example.hospital_management.repository.InvoiceRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ModelMapper modelMapper;

    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok().body(invoiceRepository.findAll());
    }

    public ResponseEntity<Invoice> addInvoice(addVoiceDto invoiceDto) {
        Invoice invoice = modelMapper.map(invoiceDto, Invoice.class);

        if (invoice.getDate() == null || invoice.getDate().isEmpty()) {
            invoice.setDate(LocalDate.now().toString());
        }
        if (invoice.getStatus() == null || invoice.getStatus().isEmpty()) {
            invoice.setStatus("pending");
        }

        // Initial save persists parent Invoice and cascade-saves child Items
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Set custom invoiceId based on database generated ID
        savedInvoice.setInvoiceId(String.format("INV%08d", savedInvoice.getId()));

        // Save again with the invoiceId set
        savedInvoice = invoiceRepository.save(savedInvoice);

        return ResponseEntity.ok().body(savedInvoice);
    }

    public ResponseEntity<Invoice> updateInvoice(updateInvoiceDto updateDto) {
        Invoice existing = invoiceRepository.findByInvoiceId(updateDto.getInvoiceId());
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Update basic fields
        if (updateDto.getPatientName() != null) {
            existing.setPatientName(updateDto.getPatientName());
        }
        if (updateDto.getStatus() != null) {
            existing.setStatus(updateDto.getStatus());
        }
        if (updateDto.getAmount() != null) {
            existing.setAmount(updateDto.getAmount());
        }

        // Clear existing items and re-add the updated items list to allow deletions & additions
        existing.getItemsList().clear();
        if (updateDto.getItemsList() != null) {
            existing.getItemsList().addAll(updateDto.getItemsList());
        }

        Invoice saved = invoiceRepository.save(existing);
        return ResponseEntity.ok().body(saved);
    }

    public ResponseEntity<String> updateInvoiceStatus(updateInvoiceDto statusDto) {
        int update = invoiceRepository.updateInvoiceStatusById(statusDto.getInvoiceId(), statusDto.getStatus());

        if (update == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().body(statusDto.toString());
    }
}
