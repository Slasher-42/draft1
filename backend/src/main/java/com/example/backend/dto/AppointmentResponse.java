package com.example.backend.dto;

import com.example.backend.enums.AppointmentStatus;
import com.example.backend.enums.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String doctor;
    private String reason;
    private LocalDate appointmentDate;
    private AppointmentStatus status;
    private Integer queueNumber;
    private QueueStatus queueStatus;
    private String patientName;
    private Long patientId;
}
