package com.college.seating.initializer;

import com.college.seating.entity.Booking;
import com.college.seating.entity.Seat;
import com.college.seating.entity.User;
import com.college.seating.repository.BookingRepository;
import com.college.seating.repository.SeatRepository;
import com.college.seating.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, SeatRepository seatRepository, BookingRepository bookingRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .department("Operations")
                    .build());
            userRepository.save(User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .role("EMPLOYEE")
                    .department("Engineering")
                    .build());
        }

        if (seatRepository.count() == 0) {
            seatRepository.save(Seat.builder().code("A1").floor("1").zone("North Wing").seatType("Desk").available(true).description("Window seat").build());
            seatRepository.save(Seat.builder().code("A2").floor("1").zone("North Wing").seatType("Hot Desk").available(true).description("Flexible seat").build());
            seatRepository.save(Seat.builder().code("B1").floor("2").zone("South Wing").seatType("Meeting Room").available(true).description("Small meeting room").build());
        }

        if (bookingRepository.count() == 0) {
            Seat seat = seatRepository.findAll().stream().findFirst().orElse(null);
            User user = userRepository.findByUsername("user").orElse(null);
            if (seat != null && user != null) {
                Booking booking = Booking.builder()
                        .seat(seat)
                        .user(user)
                        .bookingDate(LocalDate.now())
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(12, 0))
                        .status("CONFIRMED")
                        .build();
                bookingRepository.save(booking);
                seat.setAvailable(false);
                seatRepository.save(seat);
            }
        }
    }
}
