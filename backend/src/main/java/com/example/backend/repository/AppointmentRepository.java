package com.example.backend.repository;

import com.example.backend.entity.Appointment;
import com.example.backend.entity.User;
import com.example.backend.enums.AppointmentStatus;
import com.example.backend.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(User patient);

    List<Appointment> findByAppointmentDateAndQueueStatusOrderByQueueNumber(
            LocalDate date, QueueStatus queueStatus);

    List<Appointment> findByAppointmentDate(LocalDate date);

    boolean existsByPatientAndAppointmentDateAndStatusNot(
            User patient, LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateOrderByQueueNumber(LocalDate date);

    long countByAppointmentDate(LocalDate date);
}
