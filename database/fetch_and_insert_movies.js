const { Client } = require('pg');
const https = require('https');

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'cinema_db',
  user: 'postgres',
  password: '20040608Tm.n',
};

// Map TVmaze English genres to Vietnamese genre slugs in DB
const TVMAZE_TO_SLUG = {
  'Action': 'hanh-dong',
  'Adventure': 'hanh-dong',
  'Comedy': 'hai-huoc',
  'Romance': 'tinh-cam',
  'Horror': 'kinh-di',
  'Science-Fiction': 'khoa-hoc-vien-tuong',
  'Fantasy': 'khoa-hoc-vien-tuong',
  'Animation': 'hoat-hinh',
  'Anime': 'hoat-hinh',
  'Music': 'hoat-hinh',
  'Musical': 'hoat-hinh',
  'Children': 'hoat-hinh',
  'Family': 'hoat-hinh',
};

const AGE_RATING_MAP = {
  'TV-Y': 'P', 'TV-Y7': 'P', 'TV-G': 'P', 'TV-PG': 'P',
  'TV-14': 'T13', 'TV-MA': 'T18', 'R': 'T18', 'PG-13': 'T13',
  'PG': 'P', 'G': 'P', 'NC-17': 'T18', 'Not Rated': 'T16'
};

const STATUS_MAP = {
  'Running': 'ACTIVE', 'Ended': 'INACTIVE',
  'To Be Determined': 'COMING_SOON', 'In Development': 'COMING_SOON',
  'New Series': 'COMING_SOON', 'Pilot': 'COMING_SOON', 'Canceled': 'INACTIVE'
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function truncate(str, max) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.substring(0, max - 3) + '...';
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

async function main() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.error('Connected to PostgreSQL');

  // Get existing movie titles to avoid duplicates
  const existingResult = await client.query("SELECT title FROM movies");
  const existingTitles = new Set(existingResult.rows.map(r => r.title.toLowerCase().trim()));
  console.error(`Existing movies in DB: ${existingTitles.size}`);

  // Get existing genres with their actual UUIDs
  const genresResult = await client.query('SELECT genre_id, name, slug FROM genres');
  const slugToGenreId = new Map(genresResult.rows.map(r => [r.slug, r.genre_id]));
  const existingGenreNames = new Set(genresResult.rows.map(r => r.name));
  console.error(`Existing genres in DB: ${genresResult.rows.length}`);

  // Build a mapping: TVmaze genre -> actual DB UUID
  function getGenreId(tvmazeGenre) {
    // First check by slug mapping
    const slug = TVMAZE_TO_SLUG[tvmazeGenre];
    if (slug && slugToGenreId.has(slug)) {
      return slugToGenreId.get(slug);
    }
    // For unmapped genres, return null (will be inserted as new genre)
    return null;
  }

  // Get max movie_id to generate new IDs
  const maxIdResult = await client.query("SELECT movie_id FROM movies ORDER BY movie_id DESC LIMIT 1");
  let nextIdx = 1;
  if (maxIdResult.rows.length > 0) {
    const lastId = maxIdResult.rows[0].movie_id;
    const match = lastId.match(/(\d+)$/);
    if (match) {
      nextIdx = parseInt(match[1]) + 1;
    }
  }
  console.error(`Next movie index: ${nextIdx}`);

  // Fetch shows from TVmaze pages 3-5 (new pages not used before)
  console.error('Fetching shows from tvmaze pages 3-5...');
  let allShows = [];
  for (let page = 3; page <= 5; page++) {
    try {
      const shows = await fetchJSON(`https://api.tvmaze.com/shows?page=${page}`);
      allShows = allShows.concat(shows);
      console.error(`Page ${page}: ${shows.length} shows`);
    } catch (e) {
      console.error(`Page ${page} failed: ${e.message}`);
    }
  }
  console.error(`Total shows fetched: ${allShows.length}`);

  // Filter
  let filtered = allShows.filter(s =>
    s.type && ['Scripted', 'Animation', 'Variety'].includes(s.type) &&
    s.runtime && s.runtime > 30 &&
    s.premiered &&
    s.name &&
    !existingTitles.has(s.name.toLowerCase().trim())
  );

  console.error(`After filtering out existing: ${filtered.length} shows`);

  filtered.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  const selected = filtered.slice(0, 20);
  console.error(`Selected ${selected.length} shows`);

  if (selected.length === 0) {
    console.error('No new movies to insert');
    await client.end();
    return;
  }

  // Insert new genres for any unmapped TVmaze genres
  const allNeededGenres = new Set();
  for (const show of selected) {
    if (show.genres) {
      for (const g of show.genres) {
        if (!getGenreId(g)) {
          allNeededGenres.add(g);
        }
      }
    }
  }

  let newGenreCounter = 0;
  for (const genreName of allNeededGenres) {
    const slug = genreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!existingGenreNames.has(genreName)) {
      await client.query(
        'INSERT INTO genres (genre_id, name, slug) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT DO NOTHING',
        [genreName, slug]
      );
      existingGenreNames.add(genreName);
      newGenreCounter++;
    }
  }

  if (newGenreCounter > 0) {
    console.error(`Inserted ${newGenreCounter} new genres`);
    // Re-query to get their UUIDs
    const updatedGenres = await client.query('SELECT genre_id, name, slug FROM genres');
    for (const row of updatedGenres.rows) {
      slugToGenreId.set(row.slug, row.genre_id);
    }
  }

  // Insert movies
  let idx = 0;
  for (const show of selected) {
    idx++;
    const movieId = `c0000003-0000-0000-0000-${String(nextIdx).padStart(12, '0')}`;
    nextIdx++;

    const title = show.name;
    const description = truncate(escapeSql(stripHtml(show.summary)), 500) || `Phim ${show.name}`;
    const duration = show.runtime;
    const language = show.language || 'Tieng Anh';
    const rating = show.rating?.average || 0;
    const ageRating = AGE_RATING_MAP[rating > 7 ? 'TV-MA' : rating > 4 ? 'TV-14' : 'TV-PG'] || 'T13';
    const trailerUrl = show.officialSite || null;
    const posterUrl = show.image?.medium || show.image?.original || null;
    const premiered = show.premiered;
    const status = STATUS_MAP[show.status] || 'ACTIVE';

    let endDate = '2026-12-31';
    if (premiered) {
      const d = new Date(premiered);
      d.setMonth(d.getMonth() + 6);
      endDate = d.toISOString().split('T')[0];
    }

    await client.query(
      `INSERT INTO movies (movie_id, title, description, duration, language, age_rating, trailer_url, poster_url, showing_start_date, showing_end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (movie_id) DO NOTHING`,
      [movieId, title, description, duration, language, ageRating,
       trailerUrl, posterUrl, premiered, endDate, status]
    );

    // Insert genre associations
    if (show.genres) {
      for (const g of show.genres) {
        let genreId = getGenreId(g);
        if (!genreId) {
          const slug = g.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          genreId = slugToGenreId.get(slug);
        }
        if (genreId) {
          await client.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [movieId, genreId]
          );
        }
      }
    }

    console.error(`  ${idx}. ${show.name} (${show.runtime}min, ${show.language || 'N/A'})`);
  }

  console.error(`\nSuccessfully inserted ${selected.length} new movies!`);
  await client.end();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
