INSERT INTO cities (id, name) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Helsinki');

INSERT INTO theaters (id, city_id, name, address) VALUES
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'Center Cinema', 'Main St 1');

INSERT INTO auditoriums (id, theater_id, name, seat_rows, seat_cols) VALUES
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1', 'Screen 1', 5, 6);

WITH rows AS (
  SELECT unnest(ARRAY['A','B','C','D','E']) AS r
),
nums AS (
  SELECT generate_series(1,6) AS n
)
INSERT INTO seats (id, auditorium_id, row_label, seat_number)
SELECT gen_random_uuid(), '00000000-0000-0000-0000-0000000000c1', r, n
FROM rows CROSS JOIN nums;

INSERT INTO movies (id, title, description, duration_minutes, poster_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dune', 'Desert, spice, politics.', 155, 'https://picsum.photos/seed/dune/300/450'),
  ('22222222-2222-2222-2222-222222222222', 'Interstellar', 'Space and time shenanigans.', 169, 'https://picsum.photos/seed/interstellar/300/450');

INSERT INTO showtimes (id, movie_id, auditorium_id, start_time, end_time, price_adult, price_child) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-0000000000c1',
    (now() + interval '1 day')::timestamptz + interval '13 hours',
    (now() + interval '1 day')::timestamptz + interval '15 hours 35 minutes', 12.50, 9.50),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-0000000000c1',
    (now() + interval '1 day')::timestamptz + interval '18 hours',
    (now() + interval '1 day')::timestamptz + interval '20 hours 50 minutes', 12.50, 9.50);
