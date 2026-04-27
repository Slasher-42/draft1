package com.example.backend.controller;

import com.example.backend.dto.AppointmentRequest;
import com.example.backend.dto.AppointmentResponse;
import com.example.backend.entity.User;
import com.example.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.createAppointment(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        appointmentService.cancelAppointment(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/queue/today")
    public ResponseEntity<List<AppointmentResponse>> getTodayQueue(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.getTodayQueue(currentUser));
    }

    @PatchMapping("/{id}/serve")
    public ResponseEntity<AppointmentResponse> markAsServed(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(appointmentService.markAsServed(id, currentUser));
    }
}
