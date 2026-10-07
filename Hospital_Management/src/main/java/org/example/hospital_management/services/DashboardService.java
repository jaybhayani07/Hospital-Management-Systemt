package org.example.hospital_management.services;

import org.example.hospital_management.dto.dashboard.DepartmentStatDto;
import org.example.hospital_management.dto.dashboard.MonthlyRevenueDto;
import org.example.hospital_management.dto.dashboard.WeeklyAppointmentDto;
import org.example.hospital_management.models.Appointments;
import org.example.hospital_management.models.Invoice;
import org.example.hospital_management.models.Patients;
import org.example.hospital_management.repository.AppointmentRepository;
import org.example.hospital_management.repository.InvoiceRepository;
import org.example.hospital_management.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    public List<WeeklyAppointmentDto> getWeeklyAppointments() {
        List<Appointments> allAppointments = appointmentRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);

        Map<String, Integer> counts = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            counts.put(d.format(formatter), 0);
        }

        for (Appointments app : allAppointments) {
            if (app.getDate() != null && !app.getDate().isEmpty()) {
                try {
                    LocalDate appDate = LocalDate.parse(app.getDate());
                    if (!appDate.isBefore(sevenDaysAgo) && !appDate.isAfter(today)) {
                        String dayStr = appDate.format(formatter);
                        counts.put(dayStr, counts.getOrDefault(dayStr, 0) + 1);
                    }
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
        }

        List<WeeklyAppointmentDto> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            result.add(new WeeklyAppointmentDto(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    public List<DepartmentStatDto> getDepartmentStats() {
        List<Patients> allPatients = patientRepository.findAll();
        Map<String, Integer> deptCounts = new HashMap<>();

        for (Patients p : allPatients) {
            String dept = p.getDepartment();
            if (dept == null || dept.trim().isEmpty()) {
                dept = "General";
            }
            deptCounts.put(dept, deptCounts.getOrDefault(dept, 0) + 1);
        }

        String[] colors = {"#8884d8", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"};
        List<DepartmentStatDto> result = new ArrayList<>();
        int colorIdx = 0;
        
        List<Map.Entry<String, Integer>> sortedList = new ArrayList<>(deptCounts.entrySet());
        sortedList.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        for (Map.Entry<String, Integer> entry : sortedList) {
            String color = colors[colorIdx % colors.length];
            result.add(new DepartmentStatDto(entry.getKey(), entry.getValue(), color));
            colorIdx++;
        }
        return result;
    }

    public List<MonthlyRevenueDto> getMonthlyRevenue() {
        List<Invoice> allInvoices = invoiceRepository.findAll();
        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        Map<String, Double> monthlyRevenue = new LinkedHashMap<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        
        // Show up to current month (minimum 6 months if possible, but let's just do Jan to Current)
        int currentMonthValue = today.getMonthValue();
        int startMonth = Math.max(1, currentMonthValue - 5); // show last 6 months 
        for (int i = startMonth; i <= currentMonthValue; i++) {
            monthlyRevenue.put(months[i - 1], 0.0);
        }

        for (Invoice invoice : allInvoices) {
            if (invoice.getDate() != null && !invoice.getDate().isEmpty()) {
                try {
                    LocalDate invoiceDate = LocalDate.parse(invoice.getDate());
                    // Include if it falls in our shown months
                    if (invoiceDate.getYear() == currentYear) {
                        int mv = invoiceDate.getMonthValue();
                        if (mv >= startMonth && mv <= currentMonthValue) {
                            String monthStr = months[mv - 1];
                            double amount = 0;
                            if (invoice.getAmount() != null) {
                                amount = Double.parseDouble(invoice.getAmount());
                            }
                            monthlyRevenue.put(monthStr, monthlyRevenue.getOrDefault(monthStr, 0.0) + amount);
                        }
                    }
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
        }

        List<MonthlyRevenueDto> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : monthlyRevenue.entrySet()) {
            result.add(new MonthlyRevenueDto(entry.getKey(), entry.getValue()));
        }
        return result;
    }
}
