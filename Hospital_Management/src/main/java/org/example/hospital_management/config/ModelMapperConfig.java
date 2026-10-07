package org.example.hospital_management.config;

import org.example.hospital_management.dto.add.addAppointmentDto;
import org.example.hospital_management.dto.update.updateAppointmentDto;
import org.example.hospital_management.dto.update.updatePatientDto;
import org.example.hospital_management.models.Appointments;
import org.example.hospital_management.models.Patients;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        modelMapper.getConfiguration().setSkipNullEnabled(true);
        modelMapper.typeMap(updatePatientDto.class, Patients.class).addMappings(mapper -> mapper.skip(Patients::setId));
        modelMapper.typeMap(addAppointmentDto.class, Appointments.class).addMappings(mapper -> mapper.skip(Appointments::setId));
        return modelMapper;
    }
}
