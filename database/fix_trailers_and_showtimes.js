const { Client } = require('pg');

const DB_CONFIG = {
  host: 'localhost', port: 5432,
  database: 'cinema_db', user: 'postgres',
  password: '20040608Tm.n',
};

const verifiedTrailers = {
  'Westworld': 'https://www.youtube.com/watch?v=JctIuZfSsa4',
  'Friday Night Lights': 'https://www.youtube.com/watch?v=9XYRZ4C2JGs',
  'Death in Paradise': 'https://www.youtube.com/watch?v=OXTwvDAMpiw',
  'Freaks and Geeks': 'https://www.youtube.com/watch?v=XMCZQq25_t4',
  'Private Practice': 'https://www.youtube.com/watch?v=GmMJOAEAjVA',
  'Strike Back': 'https://www.youtube.com/watch?v=7M6VpPqHgxE',
  'Being Human': 'https://www.youtube.com/watch?v=px2DN3OuMgI',
  'Beverly Hills, 90210': 'https://www.youtube.com/watch?v=zPgq2D6l6UU',
  'Knight Rider': 'https://www.youtube.com/watch?v=HIyaGQ5d1yo',
  'Dawson\'s Creek': 'https://www.youtube.com/watch?v=OYXyGXfYqhg',
  'Pushing Daisies': 'https://www.youtube.com/watch?v=O2JdU7WqHYA',
  'Magnum P.I.': 'https://www.youtube.com/watch?v=lxnFl3wpKEI',
  'Hawaii Five-O': 'https://www.youtube.com/watch?v=3vlb7sFIgqY',
  'Camelot': 'https://www.youtube.com/watch?v=I2KZql1z_Gw',
  'Tru Calling': 'https://www.youtube.com/watch?v=4IVjAqVfVFs',
  'V': 'https://www.youtube.com/watch?v=F6T8cA0DYkM',
  'Baywatch': 'https://www.youtube.com/watch?v=1b1MOnBcyoQ',
  'Agatha Christie\'s Poirot': 'https://www.youtube.com/watch?v=DKF9VLO_k0I',
  'Good Witch': 'https://www.youtube.com/watch?v=krNNXnTzjvM',
  'Low Winter Sun': 'https://www.youtube.com/watch?v=SQh5Z9LOKYs',
  'The Expanse': 'https://www.youtube.com/watch?v=8X5gXIQmY-E',
  'Mr. Robot': 'https://www.youtube.com/watch?v=U94litUpZuc',
  'The Walking Dead': 'https://www.youtube.com/watch?v=R1v0uFms68U',
  'Black Mirror': 'https://www.youtube.com/watch?v=1iqra1ojEvM',
  'House of Cards': 'https://www.youtube.com/watch?v=x1E8PSGcyqI',
  'Dexter': 'https://www.youtube.com/watch?v=YQeUmSD1c3g',
  'Better Call Saul': 'https://www.youtube.com/watch?v=l1xIGfVFb-U',
  'Orange Is the New Black': 'https://www.youtube.com/watch?v=8R4OZg5s3K0',
  'The Office': 'https://www.youtube.com/watch?v=L_-9kqbijig',
  'Parks and Recreation': 'https://www.youtube.com/watch?v=pMvSjjEH-Q8',
  'Brooklyn Nine-Nine': 'https://www.youtube.com/watch?v=faT4YPeMUe4',
  'Mindhunter': 'https://www.youtube.com/watch?v=1-8lU4LP-X0',
  'Vikings': 'https://www.youtube.com/watch?v=9GgxinPwAGc',
  'Peaky Blinders': 'https://www.youtube.com/watch?v=EM12mcTEI88',
  'Fargo': 'https://www.youtube.com/watch?v=PaPj3Tj7L1s',
  'Outlander': 'https://www.youtube.com/watch?v=c7qD3g5v8mI',
  'Narcos': 'https://www.youtube.com/watch?v=RNWAKZzgbp4',
  'The Crown': 'https://www.youtube.com/watch?v=JWtnJjn6ng0',
  'Stranger Things': 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
  'The Handmaid\'s Tale': 'https://www.youtube.com/watch?v=PJTonA2G_K4',
  'The Witcher': 'https://www.youtube.com/watch?v=ndl1W4ltcmg',
  'The Mandalorian': 'https://www.youtube.com/watch?v=aOC8E8z_ifw',
  'Chernobyl': 'https://www.youtube.com/watch?v=s9APLXM9Ei8',
  'The Boys': 'https://www.youtube.com/watch?v=M1bhOaLV4FU',
  'Succession': 'https://www.youtube.com/watch?v=nB_l8h9spVw',
  'The Last of Us': 'https://www.youtube.com/watch?v=uLtkt8BonwM',
  'Squid Game': 'https://www.youtube.com/watch?v=oqxAJKy0ii4',
  'Money Heist': 'https://www.youtube.com/watch?v=_InqQJRqGW4',
  'Dark': 'https://www.youtube.com/watch?v=ESEUoa-mz2c',
  'Sons of Anarchy': 'https://www.youtube.com/watch?v=paBZJJXUEtg',
};

const showtimeSlots = [
  { hour: 9, min: 0, price: 65000 },
  { hour: 11, min: 30, price: 75000 },
  { hour: 14, min: 0, price: 85000 },
  { hour: 16, min: 30, price: 85000 },
  { hour: 19, min: 0, price: 95000 },
  { hour: 21, min: 30, price: 95000 },
];

async function main() {
  const c = new Client(DB_CONFIG);
  await c.connect();
  console.error('Connected to PostgreSQL');

  // Lấy danh sách rooms
  const rooms = await c.query('SELECT room_id, room_name FROM rooms');
  const roomIds = rooms.rows.map(r => r.room_id);
  console.error(`Rooms: ${rooms.rows.map(r => r.room_name).join(', ')}`);

  // Lấy tất cả movies
  const movies = await c.query('SELECT movie_id, title FROM movies ORDER BY movie_id::text');
  console.error(`Movies: ${movies.rows.length}`);

  // =========== BƯỚC 1: Cập nhật trailer ===========
  console.error('\n=== Bước 1: Cập nhật trailer YouTube cho tất cả phim ===');

  let trailerCount = 0;
  for (const movie of movies.rows) {
    const trailerUrl = verifiedTrailers[movie.title];
    if (trailerUrl) {
      await c.query('UPDATE movies SET trailer_url = $1 WHERE movie_id = $2', [trailerUrl, movie.movie_id]);
      trailerCount++;
      console.error(`  ${movie.title}`);
    } else {
      console.error(`  ${movie.title} - KHONG CO TRAILER`);
    }
  }
  console.error(`\nDa cap nhat ${trailerCount}/${movies.rows.length} phim co trailer`);

  // =========== BƯỚC 2: Xóa showtimes cũ và thêm mới ===========
  console.error('\n=== Bước 2: Tao suat chieu cho tat ca phim ===');

  // Xóa showtimes cũ
  const delResult = await c.query('DELETE FROM showtimes');
  console.error(`Da xoa ${delResult.rowCount} suat chieu cu`);

  // Tạo showtimes mới cho mỗi phim
  let showtimeCount = 0;
  const usedSlots = new Set();

  for (const movie of movies.rows) {
    // Mỗi phim có 2 suất chiếu/ngày trong 3 ngày khác nhau
    const dates = ['2026-06-25', '2026-06-26', '2026-06-27'];

    for (const dateStr of dates) {
      // Chọn 2 khung giờ ngẫu nhiên cho mỗi phim
      const slots = [...showtimeSlots].sort(() => Math.random() - 0.5).slice(0, 2);

      for (const slot of slots) {
        const roomId = roomIds[showtimeCount % roomIds.length];
        const startTime = `${dateStr} ${String(slot.hour).padStart(2, '0')}:${String(slot.min).padStart(2, '0')}:00`;
        const endHour = slot.hour + 2;
        const endMin = slot.min;
        const endTime = `${dateStr} ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`;

        const showtimeId = `e0000003-0000-0000-0000-${String(showtimeCount + 1).padStart(12, '0')}`;

        await c.query(
          `INSERT INTO showtimes (showtime_id, movie_id, room_id, start_time, end_time, base_price, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')`,
          [showtimeId, movie.movie_id, roomId, startTime, endTime, slot.price]
        );

        showtimeCount++;
      }
    }
  }

  console.error(`Da tao ${showtimeCount} suat chieu moi`);

  // Kiểm tra
  const check = await c.query('SELECT COUNT(*) as cnt FROM showtimes');
  console.error(`\nTong so suat chieu trong DB: ${check.rows[0].cnt}`);

  await c.end();
}

main().catch(e => { console.error('Loi:', e.message); process.exit(1); });
