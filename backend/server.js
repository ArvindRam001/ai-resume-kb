const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        file_name TEXT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id SERIAL PRIMARY KEY,
        title TEXT,
        company TEXT,
        description TEXT NOT NULL,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDB();

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.post('/api/resumes/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text;
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    if (path.extname(fileName).toLowerCase() === '.docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (path.extname(fileName).toLowerCase() === '.pdf') {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const query = 'INSERT INTO resumes (text, file_name) VALUES ($1, $2) RETURNING *';
    const values = [text, fileName];
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

app.post('/api/job-descriptions/url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cookie': 'dummy=1'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);

    // Try multiple selectors for job title
    let title = $('meta[property="og:title"]').attr('content') ||
                $('h1').first().text() ||
                $('title').text();

    // Try multiple selectors for company name
    let company = $('meta[property="og:site_name"]').attr('content') ||
                 $('.company-name').text() ||
                 new URL(url).hostname.replace('www.', '').split('.')[0];

    // Try multiple selectors for job description
    let description = $('meta[property="og:description"]').attr('content') ||
                     $('.job-description').text() ||
                     $('[data-automation="job-details-job-description"]').text() ||
                     $('main').text();

    // Clean up the text
    title = title ? title.trim() : '';
    company = company ? company.trim() : '';
    description = description ? description.trim() : '';

    if (!description || description.length < 50) {
      return res.status(400).json({ error: 'Could not extract valid job description' });
    }

    // Save to database
    const query = 'INSERT INTO job_descriptions (title, company, description, url) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [title, company, description, url];
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Error processing URL: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});