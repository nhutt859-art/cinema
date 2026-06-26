package com.cinema.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.entity.Booking;
import com.cinema.enums.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Booking> findByBookingStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime time);

    long countByBookingStatus(BookingStatus status);

    @Query(value = """
        SELECT b.booking_id, b.total_amount, b.booking_status, b.created_at,
               u.full_name as customer_name,
               (SELECT m2.title FROM booking_seats bs2
                JOIN showtimes s2 ON s2.showtime_id = bs2.showtime_id
                JOIN movies m2 ON m2.movie_id = s2.movie_id
                WHERE bs2.booking_id = b.booking_id LIMIT 1) as movie_title,
               (SELECT s3.start_time FROM booking_seats bs3
                JOIN showtimes s3 ON s3.showtime_id = bs3.showtime_id
                WHERE bs3.booking_id = b.booking_id LIMIT 1) as showtime
        FROM bookings b
        JOIN users u ON u.user_id = b.user_id
        ORDER BY b.created_at DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> findRecentBookings();

    @Query(value = """
        SELECT m.title, COUNT(DISTINCT b.booking_id) as total_bookings,
               COALESCE(SUM(b.total_amount), 0) as total_revenue
        FROM bookings b
        JOIN booking_seats bs ON bs.booking_id = b.booking_id
        JOIN showtimes s ON s.showtime_id = bs.showtime_id
        JOIN movies m ON m.movie_id = s.movie_id
        WHERE b.booking_status = 'PAID'
        GROUP BY m.movie_id, m.title
        ORDER BY total_bookings DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> findPopularMovies();

    @Query(value = """
        SELECT g.name, COUNT(DISTINCT mg.movie_id) as movie_count
        FROM movie_genres mg
        JOIN genres g ON g.genre_id = mg.genre_id
        JOIN movies m ON m.movie_id = mg.movie_id
        WHERE m.status IN ('ACTIVE', 'COMING_SOON')
        GROUP BY g.genre_id, g.name
        ORDER BY movie_count DESC
        """, nativeQuery = true)
    List<Object[]> findGenreDistribution();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus = 'PAID'")
    double totalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.bookingStatus = 'PAID' AND b.createdAt BETWEEN :start AND :end")
    double revenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT FUNCTION('DATE', b.createdAt) as date, COALESCE(SUM(b.totalAmount), 0) FROM Booking b "
         + "WHERE b.bookingStatus = 'PAID' AND b.createdAt BETWEEN :start AND :end "
         + "GROUP BY FUNCTION('DATE', b.createdAt) ORDER BY date")
    List<Object[]> dailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
