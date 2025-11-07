CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE theaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text
);

CREATE TABLE auditoriums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
  name text NOT NULL,
  seat_rows int NOT NULL,
  seat_cols int NOT NULL
);

CREATE TABLE seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditorium_id uuid NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
  row_label text NOT NULL,
  seat_number int NOT NULL,
  CONSTRAINT uq_aud_row_seat UNIQUE (auditorium_id, row_label, seat_number)
);

CREATE TABLE movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes int NOT NULL,
  poster_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE showtimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  auditorium_id uuid NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  price_adult numeric(8,2) NOT NULL DEFAULT 12.50,
  price_child numeric(8,2) NOT NULL DEFAULT 9.50,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_showtimes_aud_start ON showtimes (auditorium_id, start_time);

CREATE TYPE user_role AS ENUM ('customer','employee','admin','master_admin');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  full_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE bookings (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  showtime_id uuid NOT NULL REFERENCES showtimes(id),
  status text NOT NULL CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','EXPIRED')),
  total_amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE booking_seats (
  id text PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id uuid NOT NULL REFERENCES seats(id),
  price numeric(8,2) NOT NULL
);
CREATE UNIQUE INDEX uq_bookingseat_showtime_seat ON booking_seats (seat_id, booking_id);
