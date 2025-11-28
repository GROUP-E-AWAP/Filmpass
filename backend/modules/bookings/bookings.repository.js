import { pool, query } from "../../config/db.js";

export function getClient() {
  return pool.connect();
}

export async function getShowtimePrice(showtimeId) {
  const result = await query(
    `SELECT price
       FROM showtime
      WHERE showtime_id = $1`,
    [showtimeId]
  );
  return result.rows[0] || null;
}

export async function findUserByEmailForBooking(email) {
  const result = await query(
    `SELECT user_id
       FROM public."user"
      WHERE email = $1
      LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function createGuestUser(name, email) {
  const result = await query(
    `INSERT INTO public."user"(name, email, password, role)
     VALUES ($1, $2, NULL, 'customer')
     RETURNING user_id`,
    [name, email]
  );
  return result.rows[0];
}

export async function checkSeatsAlreadyBooked(client, showtimeId, seatIds) {
  const result = await client.query(
    `SELECT 1
       FROM booking_seat bs
       JOIN booking b ON b.booking_id = bs.booking_id
      WHERE bs.seat_id = ANY($1::int[])
        AND b.showtime_id = $2
        AND b.status = 'confirmed'
      LIMIT 1`,
    [seatIds, showtimeId]
  );
  return result.rows.length > 0;
}

export async function createBookingWithSeats(client, { userId, showtimeId, seats, ticketType, price, total }) {
  const bookingResult = await client.query(
    `INSERT INTO booking (user_id, showtime_id, seats, total_amount, status)
     VALUES ($1, $2, $3, $4, 'confirmed')
     RETURNING booking_id`,
    [userId, showtimeId, seats.length, total]
  );
  const bookingId = bookingResult.rows[0].booking_id;

  for (const seatId of seats) {
    await client.query(
      `INSERT INTO booking_seat (booking_id, seat_id, ticket_type, price)
       VALUES ($1, $2, $3, $4)`,
      [bookingId, seatId, ticketType, price]
    );
  }

  return bookingId;
}
