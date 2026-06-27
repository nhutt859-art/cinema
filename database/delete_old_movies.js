const { Client } = require('pg');

async function main() {
  const c = new Client({
    host: 'localhost', port: 5432,
    database: 'cinema_db', user: 'postgres',
    password: '20040608Tm.n',
  });
  await c.connect();

  // Find old movies (not starting with c0000003)
  const old = await c.query(
    "SELECT movie_id, title FROM movies WHERE movie_id::text NOT LIKE 'c0000003%'"
  );
  console.log(`Old movies to delete: ${old.rows.length}`);
  old.rows.forEach(r => console.log(`  ${r.movie_id} - ${r.title}`));

  if (old.rows.length === 0) {
    console.log('No old movies found');
    await c.end();
    return;
  }

  const ids = old.rows.map(r => `'${r.movie_id}'`).join(',');

  let r;

  // Delete booking_seats referencing old movie showtimes
  r = await c.query(`DELETE FROM booking_seats WHERE showtime_id IN (SELECT showtime_id FROM showtimes WHERE movie_id IN (${ids}))`);
  console.log(`Deleted booking_seats: ${r.rowCount}`);

  // Delete showtimes for old movies
  r = await c.query(`DELETE FROM showtimes WHERE movie_id IN (${ids})`);
  console.log(`Deleted showtimes: ${r.rowCount}`);

  // Delete movie_genres for old movies (already done if run before, but safe)
  r = await c.query(`DELETE FROM movie_genres WHERE movie_id IN (${ids})`);
  console.log(`Deleted movie_genres: ${r.rowCount}`);

  // Delete old movies
  r = await c.query(`DELETE FROM movies WHERE movie_id IN (${ids})`);
  console.log(`Deleted movies: ${r.rowCount}`);

  // Verify
  const remaining = await c.query("SELECT COUNT(*) as cnt FROM movies");
  console.log(`\nRemaining movies: ${remaining.rows[0].cnt}`);

  const tvmaze = await c.query("SELECT title, movie_id FROM movies WHERE movie_id::text LIKE 'c0000003%' ORDER BY movie_id");
  console.log('TVmaze movies kept:');
  tvmaze.rows.forEach((r, i) => console.log(`  ${i+1}. ${r.title} (${r.movie_id})`));

  await c.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
