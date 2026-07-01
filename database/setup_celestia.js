const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const NEON_URL = 'postgresql://neondb_owner:npg_7Cgx5pasXwet@ep-shy-mouse-aovpduzv.c-2.ap-southeast-1.aws.neon.tech';
const DB_NAME = 'celestia';

async function run() {
  // Step 1: Drop & recreate database
  console.log('Dropping and recreating database celestia...');
  const adminPool = new Pool({ connectionString: `${NEON_URL}/postgres?sslmode=require` });
  try {
    await adminPool.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
    console.log('Database celestia recreated!');
  } catch (err) {
    console.log('Could not drop/recreate:', err.message);
    console.log('Trying to continue with existing database...');
  } finally {
    await adminPool.end();
  }

  // Step 2: Run init.sql
  console.log('Running init.sql...');
  const dbPool = new Pool({ connectionString: `${NEON_URL}/${DB_NAME}?sslmode=require` });
  try {
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await dbPool.query(initSql);
    console.log('init.sql completed!');
  } finally {
    await dbPool.end();
  }

  // Step 3: Run seed SQL files
  const seeds = [
    'seed_tvmaze_data.sql',
    'seed_tvmaze_batch2.sql',
    'seed_coming_soon.sql',
    'seed_showtimes.sql',
  ];
  for (const file of seeds) {
    console.log(`Running ${file}...`);
    const pool = new Pool({ connectionString: `${NEON_URL}/${DB_NAME}?sslmode=require` });
    try {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await pool.query(sql);
      console.log(`${file} completed!`);
    } catch (err) {
      console.error(`${file} error:`, err.message);
    } finally {
      await pool.end();
    }
  }

  console.log('All done!');
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
