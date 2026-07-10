import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import db from './db.js';
import { mockAlumni } from '../src/data/mockAlumni.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to resolve mock lat/lng coordinates for Excel records
function getCoordinatesForCity(city) {
  if (!city) return { lat: 10.0104, lng: 77.4768 }; // Default to Theni
  
  const clean = city.trim().toLowerCase();
  
  // Add some slight randomness (+/- 0.04 degrees) to coordinates to prevent exact overlapping pins!
  const rnd = () => (Math.random() - 0.5) * 0.08;

  if (clean.includes('chennai') || clean.includes('madras')) {
    return { lat: 13.0827 + rnd(), lng: 80.2707 + rnd() };
  }
  if (clean.includes('bangalore') || clean.includes('banglore') || clean.includes('bengaluru')) {
    return { lat: 12.9716 + rnd(), lng: 77.5946 + rnd() };
  }
  if (clean.includes('coimbatore') || clean.includes('kovai')) {
    return { lat: 11.0168 + rnd(), lng: 76.9558 + rnd() };
  }
  if (clean.includes('theni')) {
    return { lat: 10.0104 + rnd(), lng: 77.4768 + rnd() };
  }
  if (clean.includes('madurai')) {
    return { lat: 9.9252 + rnd(), lng: 78.1198 + rnd() };
  }
  if (clean.includes('trichy') || clean.includes('tiruchirappalli')) {
    return { lat: 10.7905 + rnd(), lng: 78.7047 + rnd() };
  }
  if (clean.includes('kochi') || clean.includes('ernakulam') || clean.includes('kerala')) {
    return { lat: 9.9312 + rnd(), lng: 76.2673 + rnd() };
  }
  if (clean.includes('hyderabad')) {
    return { lat: 17.3850 + rnd(), lng: 78.4867 + rnd() };
  }
  if (clean.includes('pune')) {
    return { lat: 18.5204 + rnd(), lng: 73.8567 + rnd() };
  }
  if (clean.includes('mumbai') || clean.includes('bombay')) {
    return { lat: 19.0760 + rnd(), lng: 72.8777 + rnd() };
  }
  if (clean.includes('delhi') || clean.includes('noida') || clean.includes('gurgaon')) {
    return { lat: 28.6139 + rnd(), lng: 77.2090 + rnd() };
  }
  
  // General Tamil Nadu region default coordinates
  return { lat: 10.7870 + rnd(), lng: 78.6984 + rnd() };
}

async function runImport() {
  console.log('🏁 [Excel Import] Starting database setup and data ingestion...');

  // Wait for the db.js async connection check to complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Initialize Tables (Run schema.sql if Postgres is connected)
  if (db.isPostgres()) {
    try {
      const sqlPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(sqlPath, 'utf8');
      await db.pool.query(schemaSql);
      
      // Reset tables to reload with coordinates schema
      await db.pool.query('TRUNCATE TABLE users CASCADE');
      await db.pool.query('TRUNCATE TABLE alumni CASCADE');
      console.log('✔️  [Database] Tables cleared and verified in PostgreSQL.');
    } catch (err) {
      console.error('❌ [Database] Error running schema.sql:', err.message);
    }
  } else {
    // Reset local fallback database
    const memoryDb = db.getMemoryDb();
    memoryDb.alumni = [];
    memoryDb.users = [
      {
        id: 1,
        email: 'admin@nscet.edu',
        password_hash: '$2b$10$HNe1WMNf2aDh4pPLIN3dFesReJw29CX/SxwvfP4rh2.rvLpZgsZn2', // AdminPass123
        role: 'admin',
        alumni_id: null
      }
    ];
    console.log('[DB Fallback] Tables initialized in local mock memory database.');
  }

  // 2. Seed Default Admin User
  const adminEmail = 'admin@nscet.edu';
  const adminPassword = 'AdminPass123';
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, salt);

  try {
    const adminCheck = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    if (adminCheck.rowCount === 0) {
      await db.query(
        'INSERT INTO users (email, password_hash, role, alumni_id) VALUES ($1, $2, $3, $4)',
        [adminEmail, adminHash, 'admin', null]
      );
      console.log(`✔️  [Database] Seeded Admin User: ${adminEmail} / ${adminPassword}`);
    }
  } catch (err) {
    console.error('❌ [Database] Error seeding admin user:', err.message);
  }

  // 3. (Mock seeding removed as requested)

  // 4. Load and Parse Excel Sheet
  try {
    const excelPath = path.join(__dirname, '../cse alumnis details.xlsx');
    if (!fs.existsSync(excelPath)) {
      console.error(`❌ [Excel Import] File not found at: ${excelPath}`);
      return;
    }

    const workbook = xlsx.readFile(excelPath);
    let totalImported = 0;

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      let batchYear = 2014;
      const yearParts = sheetName.split('-');
      if (yearParts.length === 2) {
        batchYear = parseInt(yearParts[1].trim());
      }

      console.log(`📦 [Excel Import] Parsing Sheet [${sheetName}] for Batch of ${batchYear}...`);

      // Find Header Index
      let headerIdx = -1;
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i] || [];
        if (row.some(val => typeof val === 'string' && (val.toLowerCase().includes('name') || val.toLowerCase().includes('s.no')))) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        console.log(`⚠️  [Excel Import] Skipped Sheet [${sheetName}] - No header row found.`);
        continue;
      }

      const headers = rows[headerIdx].map(h => (h || '').toString().trim().toLowerCase());
      
      // Map Header Columns
      const nameCol = headers.findIndex(h => h.includes('name'));
      const contactCol = headers.findIndex(h => h.includes('contact') || h.includes('phone') || h.includes('detail'));
      const placeCol = headers.findIndex(h => h.includes('place') || h.includes('working') || h.includes('company') || h.includes('employer'));
      const roleCol = headers.findIndex(h => h.includes('role') || h.includes('designation'));
      const expCol = headers.findIndex(h => h.includes('experience') || h.includes('exp'));

      // Process Data Rows
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i] || [];
        if (row.length === 0 || !row[nameCol]) continue; // Skip empty rows or missing names

        const rawName = row[nameCol].toString().trim();
        const rawPhone = contactCol !== -1 && row[contactCol] ? row[contactCol].toString().trim() : null;
        const rawPlace = placeCol !== -1 && row[placeCol] ? row[placeCol].toString().trim() : null;
        const rawRole = roleCol !== -1 && row[roleCol] ? row[roleCol].toString().trim() : null;
        const rawExp = expCol !== -1 && row[expCol] ? row[expCol].toString().trim() : null;

        const isNil = (val) => !val || ['nil', 'n/a', 'none', 'no', 'working place'].includes(val.toLowerCase());
        
        const phone = isNil(rawPhone) ? null : rawPhone;
        const experience = isNil(rawExp) ? null : rawExp;
        
        let company = null;
        let city = 'Theni'; // Default local city
        let role = isNil(rawRole) ? null : rawRole;
        let placed = false;

        if (!isNil(rawPlace)) {
          placed = true;
          if (rawPlace.includes(',')) {
            const parts = rawPlace.split(',');
            company = parts[0].trim();
            city = parts[1].trim();
          } else {
            company = rawPlace;
            city = 'Chennai'; // Default metro city
          }
        }

        const email = null;
        const department = 'CSE';

        const bio = placed 
          ? `NSCET graduate working as ${role || 'Professional'} at ${company} in ${city}.`
          : `NSCET graduate currently exploring opportunities.`;

        // Get coordinates based on city name mapping
        const coords = getCoordinatesForCity(city);

        try {
          const insertQuery = `
            INSERT INTO alumni (
              name, phone, email, batch_year, department, 
              current_company, "current_role", location_city, location_country, location_lat, location_lng,
              bio, skills, achievements, mentor_available, mentor_fields, 
              verified, status, placed, experience_years, photo_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (email) DO NOTHING
            RETURNING id;
          `;

          await db.query(insertQuery, [
            rawName,
            phone,
            email,
            batchYear,
            department,
            company,
            role,
            city,
            'India',
            null, // No mock location coordinates
            null, // No mock location coordinates
            bio,
            placed ? ['Software Engineering', 'Problem Solving'] : ['Learning'],
            [],
            false,
            [],
            true,
            'approved',
            placed,
            experience,
            null
          ]);

          totalImported++;
        } catch (err) {
          console.error(`❌ [Excel Import] Failed to insert ${rawName}:`, err.message);
        }
      }
    }

    console.log(`\n🎉 [Excel Import] Complete! Successfully ingested ${totalImported} alumni records.`);

    // Save fallback offline cache JSON
    if (!db.isPostgres()) {
      const memoryDbPath = path.join(__dirname, 'memoryDb.json');
      fs.writeFileSync(memoryDbPath, JSON.stringify(db.getMemoryDb(), null, 2));
      console.log(`💾 [Excel Import] Offline Fallback saved to: server/memoryDb.json`);
    }

  } catch (err) {
    console.error('❌ [Excel Import] Fatal error during import process:', err.message);
  }
}

if (process.argv[1] && process.argv[1].endsWith('importExcel.js')) {
  runImport().then(() => {
    process.exit(0);
  });
}

export { runImport };
