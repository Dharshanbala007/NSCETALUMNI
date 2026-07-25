import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'nscet_alumni',
});

async function seedData() {
  try {
    // We need an alumni record to link contributions to
    const checkAlumni = await pool.query("SELECT * FROM alumni LIMIT 1");
    let alumniId;
    
    if (checkAlumni.rows.length === 0) {
        const result = await pool.query(`INSERT INTO alumni (name, batch_year, department, current_role) VALUES ('Mock Speaker', 2020, 'CSE', 'Software Engineer') RETURNING id`);
        alumniId = result.rows[0].id;
    } else {
        alumniId = checkAlumni.rows[0].id;
    }

    // Insert contributions
    await pool.query(`
      INSERT INTO alumni_contributions (alumni_id, title, type, description, event_date, status, link) VALUES 
      ($1, 'Future of AI in Web Development', 'webinar', 'Explore how large language models are reshaping the ecosystem.', NOW() + INTERVAL '5 days', 'upcoming', '#'),
      ($1, 'System Design for Scale', 'masterclass', 'Interactive whiteboard session covering load balancers and sharding.', NOW() + INTERVAL '2 days', 'upcoming', '#'),
      ($1, 'Resume Building Workshop', 'workshop', 'Live resume reviews and mock interviews.', NOW() - INTERVAL '10 days', 'completed', '#')
    `, [alumniId]);

    // Insert event gallery
    await pool.query(`
      INSERT INTO event_gallery (title, category, image_url, event_date) VALUES 
      ('Annual Tech Fest 2025', 'Hackathons', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '30 days'),
      ('Alumni Reunion Dinner', 'Reunions', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '60 days'),
      ('Cultural Fest Finale', 'Cultural', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '15 days'),
      ('Startup Pitch Night', 'Hackathons', 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800', NOW() - INTERVAL '120 days')
    `);

    console.log('Seed data successfully applied to Postgres.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await pool.end();
  }
}

seedData();
