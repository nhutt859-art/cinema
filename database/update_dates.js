const { Client } = require('pg');

async function main() {
  const c = new Client({
    host: 'localhost', port: 5432,
    database: 'cinema_db', user: 'postgres',
    password: '20040608Tm.n',
  });
  await c.connect();

  // Update ACTIVE movies
  let r = await c.query(
    "UPDATE movies SET showing_start_date='2026-06-01', showing_end_date='2026-08-31' WHERE movie_id::text LIKE 'c0000003%' AND status='ACTIVE'"
  );
  console.log('Updated ACTIVE movies:', r.rowCount);

  // Update COMING_SOON movies
  r = await c.query(
    "UPDATE movies SET showing_start_date='2026-07-01', showing_end_date='2026-09-30' WHERE movie_id::text LIKE 'c0000003%' AND status='COMING_SOON'"
  );
  console.log('Updated COMING_SOON movies:', r.rowCount);

  // Update INACTIVE movies to ACTIVE
  r = await c.query(
    "UPDATE movies SET showing_start_date='2026-06-15', showing_end_date='2026-08-15', status='ACTIVE' WHERE movie_id::text LIKE 'c0000003%' AND status='INACTIVE'"
  );
  console.log('Updated INACTIVE->ACTIVE movies:', r.rowCount);

  // Check final state
  r = await c.query("SELECT status, COUNT(*) as cnt FROM movies WHERE movie_id::text LIKE 'c0000003%' GROUP BY status");
  console.log('TVmaze movies by status:');
  r.rows.forEach(row => console.log(' ', row.status, row.cnt));

  await c.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
