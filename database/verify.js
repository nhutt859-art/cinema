const { Client } = require('pg');
(async () => {
  const c = new Client({ host: 'localhost', port: 5432, database: 'cinema_db', user: 'postgres', password: '20040608Tm.n' });
  await c.connect();
  const r = await c.query("SELECT title, LEFT(description, 60) as desc_short, trailer_url FROM movies ORDER BY movie_id::text");
  console.log('Total movies:', r.rows.length);
  r.rows.forEach((row, i) => {
    const trailer = row.trailer_url ? 'Co trailer' : 'Khong co trailer';
    console.log(`${i+1}. ${row.title}`);
    console.log(`   Mo ta: ${row.desc_short}...`);
    console.log(`   ${trailer}`);
  });
  await c.end();
})();
