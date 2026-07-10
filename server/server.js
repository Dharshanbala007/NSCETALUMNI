import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nscet_secret_key_123';

app.use(cors());
app.use(express.json());

// Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads', 'pending'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Middleware: Verify JWT and inject user context
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = user;
    next();
  });
};

// Middleware: Require Admin role
const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required.' });
    }
    next();
  });
};

// Helper to format flat SQL rows into nested front-end objects
const formatAlumniRow = (a) => {
  if (!a) return null;
  const city = a.location_city !== undefined ? a.location_city : (a.location?.city || null);
  const country = a.location_country !== undefined ? a.location_country : (a.location?.country || 'India');
  const lat = a.location_lat !== undefined ? a.location_lat : (a.location?.lat || null);
  const lng = a.location_lng !== undefined ? a.location_lng : (a.location?.lng || null);

  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    batch_year: a.batch_year,
    department: a.department,
    current_company: a.current_company,
    current_role: a.current_role,
    bio: a.bio,
    skills: a.skills || [],
    achievements: a.achievements || [],
    mentor_available: a.mentor_available,
    mentor_fields: a.mentor_fields || [],
    verified: a.verified,
    status: a.status,
    placed: a.placed,
    experience_years: a.experience_years,
    photo_url: a.photo_url,
    location: {
      city,
      country,
      lat: lat !== null && lat !== undefined ? parseFloat(lat) : null,
      lng: lng !== null && lng !== undefined ? parseFloat(lng) : null
    }
  };
};

// -------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password, name, loginType } = req.body;

  try {
    // A. Admin Login (username: asdf, password: 1234)
    if (loginType === 'admin') {
      if (!username || !password) {
        return res.status(400).json({ error: 'Please provide username and password.' });
      }

      if (username.trim() !== 'asdf' || password !== '1234') {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: 1, username: 'asdf', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: { username: 'asdf', role: 'admin' }
      });
    }

    // B. Alumni Login (name + universal password 1234)
    if (loginType === 'alumni') {
      if (!name || !password) {
        return res.status(400).json({ error: 'Please provide your Name and Password.' });
      }

      if (password !== '1234') {
        return res.status(401).json({ error: 'Invalid password.' });
      }

      // Clean inputs for matching
      const cleanName = name.trim().toLowerCase();

      // Find alumni by name
      let alumniRecord = null;
      
      if (db.isPostgres()) {
        const result = await db.query(
          'SELECT * FROM alumni WHERE LOWER(TRIM(name)) = $1',
          [cleanName]
        );
        if (result.rowCount > 0) {
          alumniRecord = result.rows[0];
        }
      } else {
        // Fallback local memory matcher
        const memoryDb = db.getMemoryDb();
        alumniRecord = memoryDb.alumni.find(a => 
          a.name.trim().toLowerCase() === cleanName
        );
      }

      if (!alumniRecord) {
        return res.status(401).json({ error: 'Alumni name not found in registry. Please check your name.' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: alumniRecord.id, name: alumniRecord.name, role: 'alumni' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: { 
          id: alumniRecord.id,
          name: alumniRecord.name, 
          role: 'alumni',
          email: alumniRecord.email || 'Not Provided',
          batch_year: alumniRecord.batch_year,
          department: alumniRecord.department
        }
      });
    }

    return res.status(400).json({ error: 'Invalid login type specified.' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error during sign in.' });
  }
});

// -------------------------------------------------------------
// 2. ALUMNI DIRECTORY ENDPOINTS
// -------------------------------------------------------------

// GET /api/alumni (Public directory - STRICTLY STRIPS PHONE NUMBERS)
app.get('/api/alumni', async (req, res) => {
  try {
    let alumniList = [];

    if (db.isPostgres()) {
      const result = await db.query("SELECT * FROM alumni WHERE status = 'approved' ORDER BY batch_year DESC, name ASC");
      alumniList = result.rows;
    } else {
      const memoryDb = db.getMemoryDb();
      alumniList = memoryDb.alumni.filter(a => a.status === 'approved');
    }

    // Apply strict privacy filter: strip out phone numbers before returning to users/guests
    const sanitizedList = alumniList.map(a => {
      const formatted = formatAlumniRow(a);
      delete formatted.phone;
      return formatted;
    });

    res.json(sanitizedList);
  } catch (err) {
    console.error('Error fetching alumni directory:', err);
    res.status(500).json({ error: 'Failed to fetch directory records.' });
  }
});

// GET /api/alumni/all (Admin only - RETURN ALL ALUMNI RECORDS INCLUDING PHONE NUMBERS)
app.get('/api/alumni/all', requireAdmin, async (req, res) => {
  try {
    let alumniList = [];

    if (db.isPostgres()) {
      const result = await db.query("SELECT * FROM alumni ORDER BY created_at DESC");
      alumniList = result.rows;
    } else {
      const memoryDb = db.getMemoryDb();
      alumniList = [...memoryDb.alumni];
    }

    // Format output and keep phone numbers intact for Admin
    const formattedList = alumniList.map(a => formatAlumniRow(a));
    res.json(formattedList);
  } catch (err) {
    console.error('Error fetching all records for admin:', err);
    res.status(500).json({ error: 'Failed to retrieve administrative registry.' });
  }
});

// POST /api/alumni/register (Self-signup)
app.post('/api/alumni/register', async (req, res) => {
  const { 
    name, phone, email, batch_year, department, 
    current_company, current_role, location_city, location_country,
    bio, skills, achievements
  } = req.body;

  if (!name || !batch_year || !department) {
    return res.status(400).json({ error: 'Name, Batch year, and Department are required.' });
  }

  try {
    const placed = current_company && !['nil', 'n/a', 'none', ''].includes(current_company.toLowerCase());
    const finalEmail = email || null;

    const queryText = `
      INSERT INTO alumni (
        name, phone, email, batch_year, department, 
        current_company, "current_role", location_city, location_country,
        bio, skills, achievements, mentor_available, mentor_fields, 
        verified, status, placed, experience_years, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id;
    `;

    const params = [
      name,
      phone || null,
      finalEmail,
      parseInt(batch_year),
      department,
      current_company || null,
      current_role || null,
      location_city || null,
      location_country || 'India',
      bio || '',
      skills || [],
      achievements || [],
      false, // mentor available
      [], // mentor fields
      false, // verified (starts false)
      'pending', // status (starts pending)
      placed,
      null, // exp
      null // photo
    ];

    const result = await db.query(queryText, params);
    
    res.status(201).json({ 
      message: 'Profile registered successfully. Awaiting admin approval.',
      alumniId: result.rows[0]?.id
    });
  } catch (err) {
    console.error('Error registering alumnus:', err);
    if (err.code === '23505') { // Unique constraint violation (email)
      return res.status(409).json({ error: 'A profile with this email is already registered.' });
    }
    res.status(500).json({ error: 'Registration failed due to a database error.' });
  }
});

// POST /api/alumni/moderate (Admin approve/reject)
app.post('/api/alumni/moderate', requireAdmin, async (req, res) => {
  const { id, action } = req.body; // action: 'approve' or 'reject'

  if (!id || !action) {
    return res.status(400).json({ error: 'Alumni ID and moderate action are required.' });
  }

  try {
    let result;
    if (action === 'approve') {
      result = await db.query(
        "UPDATE alumni SET status = 'approved', verified = true WHERE id = $1 RETURNING *",
        [id]
      );
    } else if (action === 'reject') {
      result = await db.query(
        "UPDATE alumni SET status = 'rejected' WHERE id = $1 RETURNING *",
        [id]
      );
    } else {
      return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    res.json({ message: `Profile successfully ${action}d.`, alumnus: formatAlumniRow(result.rows[0]) });
  } catch (err) {
    console.error('Error moderating profile:', err);
    res.status(500).json({ error: 'Moderation failed due to server error.' });
  }
});

// POST /api/alumni/update-geo (Admin only)
app.post('/api/alumni/update-geo', requireAdmin, async (req, res) => {
  const { id, city, country, lat, lng } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Alumni ID is required.' });
  }

  try {
    const finalLat = lat !== '' && lat !== null && lat !== undefined ? parseFloat(lat) : null;
    const finalLng = lng !== '' && lng !== null && lng !== undefined ? parseFloat(lng) : null;

    if (db.isPostgres()) {
      await db.query(
        'UPDATE alumni SET location_city = $1, location_country = $2, location_lat = $3, location_lng = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [city || null, country || 'India', finalLat, finalLng, id]
      );
    } else {
      const memoryDb = db.getMemoryDb();
      const idx = memoryDb.alumni.findIndex(a => a.id == id || a.id == parseInt(id) || a.id === id.toString());
      if (idx !== -1) {
        memoryDb.alumni[idx].location_city = city || null;
        memoryDb.alumni[idx].location_country = country || 'India';
        memoryDb.alumni[idx].location_lat = finalLat;
        memoryDb.alumni[idx].location_lng = finalLng;
        // Also update nested location if present
        if (memoryDb.alumni[idx].location) {
          memoryDb.alumni[idx].location.city = city || null;
          memoryDb.alumni[idx].location.country = country || 'India';
          memoryDb.alumni[idx].location.lat = finalLat;
          memoryDb.alumni[idx].location.lng = finalLng;
        }
        
        // Save to JSON
        const memoryDbPath = path.join(__dirname, 'memoryDb.json');
        fs.writeFileSync(memoryDbPath, JSON.stringify(memoryDb, null, 2));
      }
    }

    res.json({ message: 'Alumni location updated successfully.' });
  } catch (err) {
    console.error('Error updating alumni location:', err);
    res.status(500).json({ error: 'Failed to update location details.' });
  }
});

// Middleware: Require Authenticated user session
const requireAuth = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access Denied: Authentication token required.' });
    }
    next();
  });
};

// POST /api/alumni/edit-request (Submit profile modifications for admin review)
app.post('/api/alumni/edit-request', requireAuth, upload.single('photo'), async (req, res) => {
  const alumniId = req.user.alumni_id || req.user.id;
  
  if (!alumniId) {
    return res.status(400).json({ error: 'Alumni account details not found in session.' });
  }

  try {
    let pendingData = {};
    if (req.body.data) {
      pendingData = JSON.parse(req.body.data);
    } else {
      pendingData = req.body; // Fallback for old requests
    }

    if (req.file) {
      pendingData.photo_url = '/uploads/pending/' + req.file.filename;
    }

    if (db.isPostgres()) {
      await db.query(
        "INSERT INTO edit_requests (alumni_id, pending_data, status) VALUES ($1, $2, 'pending') RETURNING *",
        [alumniId, JSON.stringify(pendingData)]
      );
    } else {
      const memoryDb = db.getMemoryDb();
      const reqRecord = {
        id: (memoryDb.editRequests || []).length + 1,
        alumni_id: parseInt(alumniId),
        pending_data: pendingData,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      memoryDb.editRequests.push(reqRecord);
      
      const memoryDbPath = path.join(__dirname, 'memoryDb.json');
      fs.writeFileSync(memoryDbPath, JSON.stringify(memoryDb, null, 2));
    }
    
    res.status(201).json({ message: 'Edit request submitted successfully. Awaiting administrator review.' });
  } catch (err) {
    console.error('Error submitting edit request:', err);
    res.status(500).json({ error: 'Failed to submit modification request.' });
  }
});
// GET /api/admin/pending-registrations (Admin fetch pending guest registrations)
app.get('/api/admin/pending-registrations', requireAdmin, async (req, res) => {
  try {
    let pendingAlumni = [];
    if (db.isPostgres()) {
      const result = await db.query("SELECT * FROM alumni WHERE status = 'pending' ORDER BY created_at DESC");
      pendingAlumni = result.rows.map(formatAlumniRow);
    } else {
      const memoryDb = db.getMemoryDb();
      pendingAlumni = memoryDb.alumni.filter(a => a.status === 'pending');
    }
    res.json(pendingAlumni);
  } catch (err) {
    console.error('Error fetching pending registrations:', err);
    res.status(500).json({ error: 'Failed to retrieve pending registrations.' });
  }
});

// GET /api/admin/edit-requests (Admin fetch pending profile updates)
app.get('/api/admin/edit-requests', requireAdmin, async (req, res) => {
  try {
    let requests = [];
    if (db.isPostgres()) {
      const result = await db.query(
        "SELECT er.*, a.name, a.department, a.batch_year FROM edit_requests er JOIN alumni a ON er.alumni_id = a.id WHERE er.status = 'pending' ORDER BY er.created_at DESC"
      );
      requests = result.rows.map(r => ({
        ...r,
        pending_data: typeof r.pending_data === 'string' ? JSON.parse(r.pending_data) : r.pending_data
      }));
    } else {
      const memoryDb = db.getMemoryDb();
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      requests = memoryDb.editRequests
        .filter(er => er.status === 'pending')
        .map(er => {
          const alumni = memoryDb.alumni.find(a => a.id == er.alumni_id || a.id == parseInt(er.alumni_id));
          return {
            ...er,
            name: alumni ? alumni.name : 'Unknown Alumnus',
            department: alumni ? alumni.department : 'Unknown',
            batch_year: alumni ? alumni.batch_year : 0
          };
        });
    }
    res.json(requests);
  } catch (err) {
    console.error('Error loading edit requests:', err);
    res.status(500).json({ error: 'Failed to retrieve edit requests.' });
  }
});

// POST /api/admin/edit-requests/moderate (Admin approve/reject edits)
app.post('/api/admin/edit-requests/moderate', requireAdmin, async (req, res) => {
  const { requestId, action } = req.body;
  
  if (!requestId || !action) {
    return res.status(400).json({ error: 'Request ID and action are required.' });
  }

  try {
    let pendingRequest = null;
    let targetAlumniId = null;

    if (db.isPostgres()) {
      const checkRes = await db.query("SELECT * FROM edit_requests WHERE id = $1 AND status = 'pending'", [requestId]);
      if (checkRes.rowCount > 0) {
        pendingRequest = checkRes.rows[0];
        pendingRequest.pending_data = typeof pendingRequest.pending_data === 'string' ? JSON.parse(pendingRequest.pending_data) : pendingRequest.pending_data;
        targetAlumniId = pendingRequest.alumni_id;
      }
    } else {
      const memoryDb = db.getMemoryDb();
      if (!memoryDb.editRequests) memoryDb.editRequests = [];
      const idx = memoryDb.editRequests.findIndex(er => er.id == requestId && er.status === 'pending');
      if (idx !== -1) {
        pendingRequest = memoryDb.editRequests[idx];
        targetAlumniId = pendingRequest.alumni_id;
      }
    }

    if (!pendingRequest) {
      return res.status(404).json({ error: 'Pending edit request not found.' });
    }

    if (action === 'approve') {
      const data = pendingRequest.pending_data;
      const skillsArray = typeof data.skills === 'string' 
        ? data.skills.split(',').map(s => s.trim()).filter(s => s !== '')
        : (Array.isArray(data.skills) ? data.skills : []);
        
      const achievementsArray = typeof data.achievements === 'string'
        ? data.achievements.split(',').map(s => s.trim()).filter(s => s !== '')
        : (Array.isArray(data.achievements) ? data.achievements : []);

      const isPlaced = data.current_company && !["nil", "n/a", "none", ""].includes(data.current_company.toLowerCase());

      let finalPhotoUrl = null;
      if (data.photo_url && data.photo_url.includes('/uploads/pending/')) {
        try {
          const oldPath = path.join(__dirname, data.photo_url);
          if (fs.existsSync(oldPath)) {
            const filename = path.basename(oldPath);
            const newPath = path.join(__dirname, 'uploads', 'profiles', filename);
            fs.renameSync(oldPath, newPath);
            finalPhotoUrl = '/uploads/profiles/' + filename;
          }
        } catch(e) { console.error('Error moving file:', e); }
      }

      if (db.isPostgres()) {
        const updateFields = `
            email = $1, 
            current_company = $2, 
            "current_role" = $3, 
            location_city = $4, 
            location_country = $5, 
            bio = $6, 
            experience_years = $7, 
            skills = $8, 
            achievements = $9, 
            placed = $10,
            updated_at = CURRENT_TIMESTAMP`;
        
        const photoUpdate = finalPhotoUrl ? `, photo_url = $12` : ``;
        
        const queryParams = [
            data.email || null,
            data.current_company || null,
            data.current_role || null,
            data.location_city || null,
            data.location_country || 'India',
            data.bio || null,
            data.experience_years || null,
            skillsArray,
            achievementsArray,
            isPlaced || false,
            targetAlumniId
        ];
        if (finalPhotoUrl) queryParams.push(finalPhotoUrl);

        await db.query(
          `UPDATE alumni SET ${updateFields}${photoUpdate} WHERE id = $11`,
          queryParams
        );
        await db.query("UPDATE edit_requests SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [requestId]);
      } else {
        const memoryDb = db.getMemoryDb();
        const alumniIdx = memoryDb.alumni.findIndex(a => a.id == targetAlumniId || a.id == parseInt(targetAlumniId));
        if (alumniIdx !== -1) {
          memoryDb.alumni[alumniIdx].email = data.email || null;
          memoryDb.alumni[alumniIdx].current_company = data.current_company || null;
          memoryDb.alumni[alumniIdx].current_role = data.current_role || null;
          memoryDb.alumni[alumniIdx].location_city = data.location_city || null;
          memoryDb.alumni[alumniIdx].location_country = data.location_country || 'India';
          memoryDb.alumni[alumniIdx].bio = data.bio || null;
          memoryDb.alumni[alumniIdx].experience_years = data.experience_years || null;
          memoryDb.alumni[alumniIdx].skills = skillsArray;
          memoryDb.alumni[alumniIdx].achievements = achievementsArray;
          memoryDb.alumni[alumniIdx].placed = isPlaced || false;
          if (finalPhotoUrl) {
            memoryDb.alumni[alumniIdx].photo_url = finalPhotoUrl;
          }
          
          if (!memoryDb.alumni[alumniIdx].location) {
            memoryDb.alumni[alumniIdx].location = {};
          }
          memoryDb.alumni[alumniIdx].location.city = data.location_city || null;
          memoryDb.alumni[alumniIdx].location.country = data.location_country || 'India';
        }
        
        const requestIdx = memoryDb.editRequests.findIndex(er => er.id == requestId);
        if (requestIdx !== -1) {
          memoryDb.editRequests[requestIdx].status = 'approved';
        }
        
        const memoryDbPath = path.join(__dirname, 'memoryDb.json');
        fs.writeFileSync(memoryDbPath, JSON.stringify(memoryDb, null, 2));
      }

      res.json({ message: 'Edit request approved and profile updated successfully.' });
    } else if (action === 'reject') {
      const data = pendingRequest.pending_data;
      if (data && data.photo_url && data.photo_url.includes('/uploads/pending/')) {
        try {
          const oldPath = path.join(__dirname, data.photo_url);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch (e) { console.error('Error deleting file:', e); }
      }

      if (db.isPostgres()) {
        await db.query("UPDATE edit_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [requestId]);
      } else {
        const memoryDb = db.getMemoryDb();
        const requestIdx = memoryDb.editRequests.findIndex(er => er.id == requestId);
        if (requestIdx !== -1) {
          memoryDb.editRequests[requestIdx].status = 'rejected';
        }
        const memoryDbPath = path.join(__dirname, 'memoryDb.json');
        fs.writeFileSync(memoryDbPath, JSON.stringify(memoryDb, null, 2));
      }

      res.json({ message: 'Edit request rejected. Profile remained unchanged.' });
    } else {
      res.status(400).json({ error: 'Invalid moderation action. Must be approve or reject.' });
    }
  } catch (err) {
    console.error('Error moderating edit request:', err);
    res.status(500).json({ error: 'Failed to process moderation action.' });
  }
});

// GET /api/stats (Analytics calculation dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    let alumni = [];

    if (db.isPostgres()) {
      const result = await db.query("SELECT * FROM alumni WHERE status = 'approved'");
      alumni = result.rows;
    } else {
      alumni = db.getMemoryDb().alumni.filter(a => a.status === 'approved');
    }

    const totalCount = alumni.length;
    const placedCount = alumni.filter(a => a.placed).length;
    const verifiedCount = alumni.filter(a => a.verified).length;
    const mentorsCount = alumni.filter(a => a.mentor_available).length;

    // Calculate department stats
    const deptStats = {};
    alumni.forEach(a => {
      deptStats[a.department] = (deptStats[a.department] || 0) + 1;
    });

    const formattedDept = Object.keys(deptStats).map(name => ({
      name,
      value: deptStats[name]
    })).sort((a,b) => b.value - a.value);

    // Calculate company counts
    const compStats = {};
    alumni.forEach(a => {
      if (a.current_company) {
        compStats[a.current_company] = (compStats[a.current_company] || 0) + 1;
      }
    });

    const formattedComp = Object.keys(compStats).map(name => ({
      name,
      alumni: compStats[name]
    })).sort((a,b) => b.alumni - a.alumni).slice(0, 5);

    // Location counts
    const countryStats = {};
    alumni.forEach(a => {
      if (a.location_country) {
        countryStats[a.location_country] = (countryStats[a.location_country] || 0) + 1;
      }
    });

    const formattedCountry = Object.keys(countryStats).map(name => ({
      name,
      count: countryStats[name]
    })).sort((a,b) => b.count - a.count).slice(0, 5);

    res.json({
      totalCount,
      placedCount,
      verifiedCount,
      mentorsCount,
      deptData: formattedDept,
      companyData: formattedComp,
      countryData: formattedCountry
    });

  } catch (err) {
    console.error('Error fetching analytics stats:', err);
    res.status(500).json({ error: 'Failed to calculate portal statistics.' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 [Server] Express backend API running on port ${PORT}`);
});
