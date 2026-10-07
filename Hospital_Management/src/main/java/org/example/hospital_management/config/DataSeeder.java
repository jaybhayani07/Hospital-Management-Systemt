package org.example.hospital_management.config;

import org.example.hospital_management.models.Staff;
import org.example.hospital_management.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        Staff admin = staffRepository.findByEmail("admin@hospital.com").orElseGet(() -> {
            Staff s = new Staff(null, "EMP-001", "Dr. Sarah Admin", "Admin", "Administration", "Management", "555-0101", "admin@hospital.com", passwordEncoder.encode("admin123"), "Active");
            System.out.println("Seeding Admin user...");
            return s;
        });
        
        Staff doctor = staffRepository.findByEmail("doctor@hospital.com").orElseGet(() -> {
            Staff s = new Staff(null, "EMP-002", "Dr. David Smith", "Doctor", "Cardiology", "Cardiologist", "555-0102", "doctor@hospital.com", passwordEncoder.encode("doctor123"), "Active");
            System.out.println("Seeding Doctor user...");
            return s;
        });

        Staff nurse = staffRepository.findByEmail("nurse@hospital.com").orElseGet(() -> {
            Staff s = new Staff(null, "EMP-003", "Nurse Emily Wilson", "Nurse", "Pediatrics", "Pediatric Nurse", "555-0103", "nurse@hospital.com", passwordEncoder.encode("nurse123"), "Active");
            System.out.println("Seeding Nurse user...");
            return s;
        });

        Staff receptionist = staffRepository.findByEmail("receptionist@hospital.com").orElseGet(() -> {
            Staff s = new Staff(null, "EMP-004", "Jane Doe", "Receptionist", "Front Desk", "Reception", "555-0104", "receptionist@hospital.com", passwordEncoder.encode("receptionist123"), "Active");
            System.out.println("Seeding Receptionist user...");
            return s;
        });
        
        staffRepository.saveAll(List.of(admin, doctor, nurse, receptionist));
        System.out.println("Demo users verified/seeded successfully.");

        // Ensure other existing users have a default password if missing
        List<Staff> staffList = staffRepository.findAll();
        boolean updated = false;
        for (Staff staff : staffList) {
            if (staff.getPassword() == null || staff.getPassword().isEmpty()) {
                staff.setPassword(passwordEncoder.encode("password123"));
                updated = true;
            }
        }
        if (updated) {
            staffRepository.saveAll(staffList);
            System.out.println("Patched other existing staff with default encrypted passwords.");
        }
    }
}
