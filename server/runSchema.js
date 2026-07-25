import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'nscet_alumni',
});

async function runSchema() {
  try {
    const schemaSql = fs.readFileSync('schema.sql', 'utf8');
    await pool.query(schemaSql);
    console.log('Schema successfully applied to Postgres.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await pool.end();
  }
}

runSchema();
