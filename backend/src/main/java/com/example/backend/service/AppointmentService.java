package com.example.backend.service;

import com.example.backend.dto.AppointmentRequest;
import com.example.backend.dto.AppointmentResponse;
import com.example.backend.entity.Appointment;
import com.example.backend.entity.User;
import com.example.backend.enums.AppointmentStatus;
import com.example.backend.enums.QueueStatus;
import com.example.backend.enums.Role;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentResponse createAppointment(AppointmentRequest request, User currentUser) {
        if (request.getDoctor() == null || request.getDoctor().isBlank()) {
            throw new BadRequestException("Doctor is required");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new BadRequestException("Reason is required");
        }

        if (request.getAppointmentDate() == null) {
            throw new BadRequestException("Appointment date is required");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        boolean duplicate = appointmentRepository.existsByPatientAndAppointmentDateAndStatusNot(
                currentUser, request.getAppointmentDate(), AppointmentStatus.CANCELLED);

        if (duplicate) {
            throw new BadRequestException("You already have an appointment on this date");
        }

        long count = appointmentRepository.countByAppointmentDate(request.getAppointmentDate());
        int queueNumber = (int) (count + 1);

        Appointment appointment = Appointment.builder()
                .patient(currentUser)
                .doctor(request.getDoctor())
                .reason(request.getReason())
                .appointmentDate(request.getAppointmentDate())
                .status(AppointmentStatus.SCHEDULED)
                .queueNumber(queueNumber)
                .queueStatus(QueueStatus.WAITING)
                .build();

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments(User currentUser) {
        List<Appointment> appointments;

        if (currentUser.getRole() == Role.PATIENT) {
            appointments = appointmentRepository.findByPatient(currentUser);
        } else {
            appointments = appointmentRepository.findAll();
        }

        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id, User currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (currentUser.getRole() == Role.PATIENT &&
                !appointment.getPatient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        return mapToResponse(appointment);
    }

    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request, User currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (currentUser.getRole() == Role.PATIENT &&
                !appointment.getPatient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled appointment");
        }

        if (request.getDoctor() == null || request.getDoctor().isBlank()) {
            throw new BadRequestException("Doctor is required");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new BadRequestException("Reason is required");
        }

        if (request.getAppointmentDate() == null) {
            throw new BadRequestException("Appointment date is required");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        appointment.setDoctor(request.getDoctor());
        appointment.setReason(request.getReason());
        appointment.setAppointmentDate(request.getAppointmentDate());

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    public void cancelAppointment(Long id, User currentUser) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (currentUser.getRole() == Role.PATIENT &&
                !appointment.getPatient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public List<AppointmentResponse> getTodayQueue(User currentUser) {
        if (currentUser.getRole() == Role.PATIENT) {
            throw new UnauthorizedException("Access denied");
        }

        return appointmentRepository
                .findByAppointmentDateOrderByQueueNumber(LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse markAsServed(Long id, User currentUser) {
        if (currentUser.getRole() == Role.PATIENT) {
            throw new UnauthorizedException("Access denied");
        }

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getQueueStatus() == QueueStatus.SERVED) {
            throw new BadRequestException("Patient is already marked as served");
        }

        appointment.setQueueStatus(QueueStatus.SERVED);
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getDoctor(),
                appointment.getReason(),
                appointment.getAppointmentDate(),
                appointment.getStatus(),
                appointment.getQueueNumber(),
                appointment.getQueueStatus(),
                appointment.getPatient().getName(),
                appointment.getPatient().getId()
        );
    }
}
