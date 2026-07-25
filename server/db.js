import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '.env') });

const config = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false } 
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'nscet_alumni',
    };

console.log(`[Database] Attempting connection to PostgreSQL (${process.env.DATABASE_URL ? 'via DATABASE_URL' : `${config.host}:${config.port}`})...`);

const pool = new Pool(config);

// A simple indicator if postgres connection succeeded
let isPostgresReady = false;

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('\n======================================================');
    console.error('⚠️  [Database Warning] Failed to connect to PostgreSQL!');
    console.error(`Error details: ${err.message}`);
    console.error('Make sure PostgreSQL is running on your machine and you have created the database specified in server/.env (e.g. nscet_alumni).');
    console.error('The backend will fall back to using simulated in-memory storage for seamless local execution.');
    console.error('======================================================\n');
  } else {
    isPostgresReady = true;
    console.log(`✔️  [Database] PostgreSQL connected successfully. DB Time: ${res.rows[0].now}`);
  }
});

// Local fallback JSON file persistence
const memoryDbPath = path.join(__dirname, 'memoryDb.json');
let memoryDb = {
  alumni: [],
  users: [
    {
      id: 1,
      email: 'admin@nscet.org',
      password_hash: '$2b$10$HNe1WMNf2aDh4pPLIN3dFesReJw29CX/SxwvfP4rh2.rvLpZgsZn2', // hashed 'AdminPass123'
      role: 'admin',
      alumni_id: null
    }
  ]
};

if (fs.existsSync(memoryDbPath)) {
  try {
    memoryDb = JSON.parse(fs.readFileSync(memoryDbPath, 'utf8'));
    if (!memoryDb.editRequests) memoryDb.editRequests = [];
    if (!memoryDb.jobs) memoryDb.jobs = [];
    if (!memoryDb.referralRequests) memoryDb.referralRequests = [];
    if (!memoryDb.mentorshipRequests) memoryDb.mentorshipRequests = [];
    console.log(`💾 [Database] Loaded ${memoryDb.alumni.length} records from local offline cache: server/memoryDb.json`);
  } catch (err) {
    console.error('⚠️ [Database] Error reading server/memoryDb.json, using fresh default database');
  }
}

const saveMemoryDb = () => {
  try {
    fs.writeFileSync(memoryDbPath, JSON.stringify(memoryDb, null, 2));
  } catch (err) {
    console.error('❌ [Database] Failed to write local JSON db:', err.message);
  }
};

export default {
  // Query wrapper
  async query(text, params) {
    if (isPostgresReady) {
      return pool.query(text, params);
    }
    
    // Simulate PG query behavior using memory DB fallback to prevent app crashing
    console.log(`[DB Fallback] Simulating PG Query: ${text.substring(0, 80)}...`);
    
    const textLower = text.toLowerCase();
    
    if (textLower.includes('insert into alumni')) {
      // Simulate alumni insertion
      const item = {
        id: memoryDb.alumni.length + 1,
        name: params[0],
        phone: params[1],
        email: params[2],
        batch_year: params[3],
        department: params[4],
        current_company: params[5],
        current_role: params[6],
        location_city: params[7],
        location_country: params[8] || 'India',
        location_lat: params[9] ? parseFloat(params[9]) : null,
        location_lng: params[10] ? parseFloat(params[10]) : null,
        bio: params[11],
        skills: params[12] || [],
        achievements: params[13] || [],
        mentor_available: params[14] || false,
        mentor_fields: params[15] || [],
        verified: params[16] || false,
        status: params[17] || 'pending',
        placed: params[18] || false,
        experience_years: params[19],
        photo_url: params[20]
      };
      memoryDb.alumni.push(item);
      saveMemoryDb();
      return { rows: [item], rowCount: 1 };
    }

    if (textLower.includes('update alumni')) {
      // E.g. UPDATE alumni SET status = $1, verified = $2 WHERE id = $3
      // E.g. UPDATE alumni SET status = 'approved', verified = true WHERE id = $1
      const id = params[params.length - 1];
      const idx = memoryDb.alumni.findIndex(a => a.id == id || a.id == parseInt(id));
      if (idx !== -1) {
        if (textLower.includes("status = 'approved'") || (params[0] === 'approved')) {
          memoryDb.alumni[idx].status = 'approved';
          memoryDb.alumni[idx].verified = true;
        } else if (textLower.includes("status = 'rejected'") || (params[0] === 'rejected')) {
          memoryDb.alumni[idx].status = 'rejected';
        }
        saveMemoryDb();
        return { rows: [memoryDb.alumni[idx]], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (textLower.includes('select * from alumni') || textLower.includes('select alumni.*')) {
      // Simulate selection
      let list = [...memoryDb.alumni];
      
      // Basic filtering support
      if (textLower.includes("status = 'approved'") || textLower.includes("status = $")) {
        list = list.filter(a => a.status === 'approved');
      }
      return { rows: list, rowCount: list.length };
    }
    
    if (textLower.includes('select * from users')) {
      const emailParam = params[0];
      const user = memoryDb.users.find(u => u.email === emailParam || u.phone === emailParam);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (textLower.includes('insert into users')) {
      const user = {
        id: memoryDb.users.length + 1,
        email: params[0],
        password_hash: params[1],
        role: params[2],
        alumni_id: params[3]
      };
      memoryDb.users.push(user);
      saveMemoryDb();
      return { rows: [user], rowCount: 1 };
    }

    if (textLower.includes('insert into edit_requests')) {
      const req = {
        id: (memoryDb.editRequests || []).length + 1,
        alumni_id: parseInt(params[0]),
        pending_data: typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1],
        status: params[2] || 'pending',
        created_at: new Date().toISOString()
      };
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      memoryDb.editRequests.push(req);
      saveMemoryDb();
      return { rows: [req], rowCount: 1 };
    }

    if (textLower.includes('select er.*') || textLower.includes('from edit_requests')) {
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      let list = memoryDb.editRequests.map(er => {
        const alumni = memoryDb.alumni.find(a => a.id == er.alumni_id);
        return {
          ...er,
          name: alumni ? alumni.name : 'Unknown Alumnus',
          department: alumni ? alumni.department : 'Unknown',
          batch_year: alumni ? alumni.batch_year : 0
        };
      });
      if (textLower.includes("status = 'pending'") || textLower.includes("status = $")) {
        list = list.filter(er => er.status === 'pending');
      }
      return { rows: list, rowCount: list.length };
    }

    if (textLower.includes('update edit_requests')) {
      const status = params[0];
      const id = params[1];
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      const idx = memoryDb.editRequests.findIndex(er => er.id == id || er.id == parseInt(id));
      if (idx !== -1) {
        memoryDb.editRequests[idx].status = status;
        saveMemoryDb();
        return { rows: [memoryDb.editRequests[idx]], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    if (textLower.includes('insert into jobs')) {
      const job = {
        id: (memoryDb.jobs || []).length + 1,
        posted_by: params[0],
        company: params[1],
        role: params[2],
        location: params[3],
        description: params[4],
        apply_link: params[5],
        employment_type: params[6],
        posted_date: params[7],
        referral_available: params[8] || false,
        referral_request_count: 0
      };
      if (!memoryDb.jobs) memoryDb.jobs = [];
      memoryDb.jobs.push(job);
      saveMemoryDb();
      return { rows: [job], rowCount: 1 };
    }

    if (textLower.includes('select j.*') || textLower.includes('from jobs')) {
      if (!memoryDb.jobs) memoryDb.jobs = [];
      let list = memoryDb.jobs.map(j => {
        const poster = memoryDb.alumni.find(a => a.id == j.posted_by);
        return {
          ...j,
          posted_by_name: poster ? poster.name : 'Unknown',
          posted_by_batch: poster ? poster.batch_year : 0,
          posted_by_dept: poster ? poster.department : 'Unknown',
          poster_email: poster ? poster.email : null
        };
      });
      // Sort newest first
      list.sort((a, b) => b.id - a.id);
      return { rows: list, rowCount: list.length };
    }

    if (textLower.includes('insert into referral_requests')) {
      const req = {
        id: (memoryDb.referralRequests || []).length + 1,
        job_id: params[0],
        requester_id: params[1],
        poster_id: params[2],
        message: params[3],
        status: 'pending',
        created_at: new Date().toISOString()
      };
      if (!memoryDb.referralRequests) memoryDb.referralRequests = [];
      memoryDb.referralRequests.push(req);
      
      // Update count
      if (!memoryDb.jobs) memoryDb.jobs = [];
      const jobIdx = memoryDb.jobs.findIndex(j => j.id == params[0]);
      if (jobIdx !== -1) {
        memoryDb.jobs[jobIdx].referral_request_count = (memoryDb.jobs[jobIdx].referral_request_count || 0) + 1;
      }
      
      saveMemoryDb();
      return { rows: [req], rowCount: 1 };
    }

    if (textLower.includes('insert into mentorship_requests')) {
      const req = {
        id: (memoryDb.mentorshipRequests || []).length + 1,
        mentor_id: params[0],
        mentee_id: params[1],
        message: params[2],
        field: params[3],
        status: 'pending',
        created_at: new Date().toISOString()
      };
      if (!memoryDb.mentorshipRequests) memoryDb.mentorshipRequests = [];
      memoryDb.mentorshipRequests.push(req);
      saveMemoryDb();
      return { rows: [req], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  },
  
  isPostgres() {
    return isPostgresReady;
  },
  
  getMemoryDb() {
    return memoryDb;
  },
  
  pool
};
