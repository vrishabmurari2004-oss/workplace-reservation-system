package com.college.seating.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BookingRequest {
    private String username;
    private Long seatId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
}