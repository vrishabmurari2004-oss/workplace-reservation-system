package com.college.seating.controller;

import com.college.seating.dto.BookingRequest;
import com.college.seating.entity.Booking;
import com.college.seating.entity.Seat;
import com.college.seating.entity.User;
import com.college.seating.repository.BookingRepository;
import com.college.seating.repository.SeatRepository;
import com.college.seating.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Booking> getBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest) {
        Seat seat = seatRepository.findById(bookingRequest.getSeatId()).orElse(null);
        if (seat == null) {
            return ResponseEntity.badRequest().body("Seat not found");
        }
        if (!seat.getAvailable()) {
            return ResponseEntity.badRequest().body("Seat is currently unavailable");
        }

        User user = userRepository.findByUsername(bookingRequest.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        seat.setAvailable(false);
        seatRepository.save(seat);

        Booking booking = Booking.builder()
                .seat(seat)
                .user(user)
                .bookingDate(bookingRequest.getBookingDate())
                .startTime(bookingRequest.getStartTime())
                .endTime(bookingRequest.getEndTime())
                .status("CONFIRMED")
                .build();

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> cancelBooking(@PathVariable("id") Long id) {
        return bookingRepository.findById(id).map(booking -> {
            Seat seat = booking.getSeat();
            if (seat != null) {
                seat.setAvailable(true);
                seatRepository.save(seat);
            }
            bookingRepository.delete(booking);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
