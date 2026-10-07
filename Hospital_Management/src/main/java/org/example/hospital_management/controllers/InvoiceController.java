package org.example.hospital_management.controllers;

import lombok.RequiredArgsConstructor;
import org.example.hospital_management.dto.add.addVoiceDto;
import org.example.hospital_management.dto.update.updateInvoiceDto;
import org.example.hospital_management.models.Invoice;
import org.example.hospital_management.services.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/invoice")
@CrossOrigin
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/allInvoices")
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @PostMapping("/addInvoice")
    public ResponseEntity<Invoice> addInvoice(@RequestBody addVoiceDto invoiceDto) {
        return invoiceService.addInvoice(invoiceDto);
    }

    @PutMapping("/updateInvoice")
    public ResponseEntity<Invoice> updateInvoice(@RequestBody updateInvoiceDto updateDto) {
        return invoiceService.updateInvoice(updateDto);
    }

    @PutMapping("/updateInvoiceStatus")
    public ResponseEntity<String> updateInvoiceStatus(@RequestBody updateInvoiceDto statusDto) {
        return invoiceService.updateInvoiceStatus(statusDto);
    }
}
