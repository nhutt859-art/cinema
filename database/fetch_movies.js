const https = require('https');

const FETCH_COUNT = 40; // fetch more to filter 20 good ones
const BASE_UUID = 'c0000002'; // start new UUID series after existing ones
const GENRE_UUID = {
  'Action': 'b0000001-0000-0000-0000-000000000001',
  'Adventure': 'b0000001-0000-0000-0000-000000000001',
  'Comedy': 'b0000001-0000-0000-0000-000000000002',
  'Romance': 'b0000001-0000-0000-0000-000000000003',
  'Horror': 'b0000001-0000-0000-0000-000000000004',
  'Science-Fiction': 'b0000001-0000-0000-0000-000000000005',
  'Fantasy': 'b0000001-0000-0000-0000-000000000005',
  'Animation': 'b0000001-0000-0000-0000-000000000006',
  'Anime': 'b0000001-0000-0000-0000-000000000006',
  'Crime': 'b0000001-0000-0000-0000-000000000007',
  'Drama': 'b0000001-0000-0000-0000-000000000008',
  'Thriller': 'b0000001-0000-0000-0000-000000000007',
  'Mystery': 'b0000001-0000-0000-0000-000000000007',
  'Music': 'b0000001-0000-0000-0000-000000000006',
  'Musical': 'b0000001-0000-0000-0000-000000000006',
  'War': 'b0000001-0000-0000-0000-000000000008',
  'Western': 'b0000001-0000-0000-0000-000000000001',
  'Sports': 'b0000001-0000-0000-0000-000000000008',
  'Supernatural': 'b0000001-0000-0000-0000-000000000005',
  'Medical': 'b0000001-0000-0000-0000-000000000008',
  'Legal': 'b0000001-0000-0000-0000-000000000008',
  'History': 'b0000001-0000-0000-0000-000000000008',
  'Biography': 'b0000001-0000-0000-0000-000000000008',
  'Reality': 'b0000001-0000-0000-0000-000000000008',
  'Talk-Show': 'b0000001-0000-0000-0000-000000000008',
  'Game-Show': 'b0000001-0000-0000-0000-000000000008',
  'Food': 'b0000001-0000-0000-0000-000000000008',
  'Travel': 'b0000001-0000-0000-0000-000000000008',
  'DIY': 'b0000001-0000-0000-0000-000000000008',
  'Nature': 'b0000001-0000-0000-0000-000000000008',
  'Soap': 'b0000001-0000-0000-0000-000000000008',
  'Children': 'b0000001-0000-0000-0000-000000000006',
  'Family': 'b0000001-0000-0000-0000-000000000006',
  'Adult': 'b0000001-0000-0000-0000-000000000007',
  'Short': 'b0000001-0000-0000-0000-000000000008'
};

const AGE_RATING_MAP = {
  'TV-Y': 'P',
  'TV-Y7': 'P',
  'TV-G': 'P',
  'TV-PG': 'P',
  'TV-14': 'T13',
  'TV-MA': 'T18',
  'R': 'T18',
  'PG-13': 'T13',
  'PG': 'P',
  'G': 'P',
  'NC-17': 'T18',
  'Not Rated': 'T16'
};

const STATUS_MAP = {
  'Running': 'ACTIVE',
  'Ended': 'INACTIVE',
  'To Be Determined': 'COMING_SOON',
  'In Development': 'COMING_SOON',
  'New Series': 'COMING_SOON',
  'Pilot': 'COMING_SOON',
  'Canceled': 'INACTIVE'
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error for ${url}: ${e.message}`)); }
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

function mapAgeRating(tvmazeRating) {
  return AGE_RATING_MAP[tvmazeRating] || 'T13';
}

function mapStatus(tvmazeStatus) {
  return STATUS_MAP[tvmazeStatus] || 'ACTIVE';
}

async function main() {
  console.error('Fetching shows from tvmaze...');

  // Fetch multiple pages to get enough shows
  let allShows = [];
  for (let page = 0; page < 3; page++) {
    try {
      const shows = await fetchJSON(`https://api.tvmaze.com/shows?page=${page}`);
      allShows = allShows.concat(shows);
      console.error(`Page ${page}: ${shows.length} shows`);
      if (shows.length === 0) break;
    } catch (e) {
      console.error(`Page ${page} failed: ${e.message}`);
      break;
    }
  }

  console.error(`Total shows fetched: ${allShows.length}`);

  // Filter: only Scripted/Animation type, has runtime, has premiered, valid
  let filtered = allShows.filter(s =>
    s.type && ['Scripted', 'Animation', 'Variety'].includes(s.type) &&
    s.runtime && s.runtime > 30 &&
    s.premiered &&
    s.name &&
    !s.name.toLowerCase().includes('hour') // skip generic
  );

  // Sort by weight (popularity) descending
  filtered.sort((a, b) => (b.weight || 0) - (a.weight || 0));

  // Pick top 25 (we'll use 20 + some extras)
  const selected = filtered.slice(0, 25);

  console.error(`Selected ${selected.length} shows`);

  // --- Generate INSERT statements ---

  let insertSQL = '';
  let genreInserts = [];

  insertSQL += `-- ============================================================\n`;
  insertSQL += `-- Movies data from tvmaze.com (${new Date().toISOString().split('T')[0]})\n`;
  insertSQL += `-- ============================================================\n\n`;

  // First, add any new genres we need
  const allNeededGenres = new Set();
  selected.forEach(show => {
    if (show.genres) {
      show.genres.forEach(g => {
        if (!GENRE_UUID[g]) {
          allNeededGenres.add(g);
        }
      });
    }
  });

  let newGenreId = 9;
  const newGenreUUIDs = {};
  if (allNeededGenres.size > 0) {
    insertSQL += `-- Additional genres from tvmaze\n`;
    insertSQL += `INSERT INTO genres (genre_id, name, slug) VALUES\n`;
    const entries = [];
    for (const genre of allNeededGenres) {
      const slug = genre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uuid = `b0000001-0000-0000-0000-${String(newGenreId).padStart(12, '0')}`;
      entries.push(`    ('${uuid}', '${genre}', '${slug}')`);
      newGenreUUIDs[genre] = uuid;
      newGenreId++;
    }
    insertSQL += entries.join(',\n') + ';\n\n';
  }

  // Movie inserts
  insertSQL += `-- Movies from tvmaze\n`;
  insertSQL += `INSERT INTO movies (movie_id, title, description, duration, language, age_rating, trailer_url, poster_url, showing_start_date, showing_end_date, status) VALUES\n`;

  let idx = 0;
  const movieIds = [];
  const movieGenrePairs = [];

  for (const show of selected) {
    idx++;
    const movieId = `${BASE_UUID}-0000-0000-${String(idx).padStart(12, '0')}`;
    movieIds.push(movieId);

    const title = escapeSql(show.name);
    const description = truncate(escapeSql(stripHtml(show.summary)), 500) || `Phim ${show.name}`;
    const duration = show.runtime;
    const language = show.language || 'Tieng Anh';
    const ageRating = mapAgeRating(show.rating?.average ? (show.rating.average > 7 ? 'TV-MA' : show.rating.average > 4 ? 'TV-14' : 'TV-PG') : 'TV-PG');
    const trailerUrl = show.officialSite || '';
    const posterUrl = show.image?.medium || show.image?.original || '';
    const premiered = show.premiered;
    const status = mapStatus(show.status);

    // Calculate end date: premiered + 6 months
    let startDate = premiered;
    let endDate = '2026-12-31';
    if (premiered) {
      const d = new Date(premiered);
      d.setMonth(d.getMonth() + 6);
      endDate = d.toISOString().split('T')[0];
    }

    const separator = idx < selected.length ? ',' : ';';
    insertSQL += `    ('${movieId}', '${title}', '${description}', ${duration}, '${language}', '${ageRating}', ${trailerUrl ? `'${trailerUrl}'` : 'NULL'}, ${posterUrl ? `'${posterUrl}'` : 'NULL'}, '${premiered}', '${endDate}', '${status}')${separator}\n`;

    // Genre associations
    if (show.genres) {
      show.genres.forEach(g => {
        const genreId = GENRE_UUID[g] || newGenreUUIDs[g];
        if (genreId) {
          movieGenrePairs.push({ movieId, genreId });
        }
      });
    }

    console.error(`  ${idx}. ${show.name} (${show.runtime}min, ${show.language || 'N/A'})`);
  }

  // Movie-genre inserts
  if (movieGenrePairs.length > 0) {
    insertSQL += `\n-- Movie-Genre associations\n`;
    insertSQL += `INSERT INTO movie_genres (movie_id, genre_id) VALUES\n`;
    insertSQL += movieGenrePairs.map((p, i) => {
      const separator = i < movieGenrePairs.length - 1 ? ',' : ';';
      return `    ('${p.movieId}', '${p.genreId}')${separator}`;
    }).join('\n');
    insertSQL += '\n';
  }

  // Output the SQL
  console.log(insertSQL);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
