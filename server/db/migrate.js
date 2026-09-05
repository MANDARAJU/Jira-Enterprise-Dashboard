const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../config');
const { createPool } = require('./pool');
const migrationsDirectory = path.join(__dirname, 'migrations');

async function runMigrations(pool, directory = migrationsDirectory) {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const files = fs.readdirSync(directory).filter(file => /^\d+_.+\.sql$/.test(file)).sort();
  const applied = new Set((await pool.query('SELECT filename FROM schema_migrations')).rows.map(row => row.filename));
  for (const file of files) {
    if (applied.has(file)) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(directory, file), 'utf8'));
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }
}

async function main() {
  let pool;
  try {
    const config = loadConfig();
    pool = createPool(config.database);
    await runMigrations(pool);
  } catch (error) {
    // Database driver errors can contain infrastructure details; retain details in secured logs only.
    console.error('Migration failed. Review the secured application logs for details.');
    process.exitCode = 1;
  } finally {
    if (pool) await pool.end();
  }
}

if (require.main === module) main();
module.exports = { migrationsDirectory, runMigrations };
