const express = require('express');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const Resume = require('./models/Resume');
const JobDescription = require('./models/JobDescription');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const port = 3003;

// Enable CORS
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Function to parse PDF files
const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Function to parse DOCX files
const parseDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

// Endpoint for uploading resumes
app.post('/api/upload/resume', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('Processing resume upload:', req.file.originalname);
    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      text = await parsePDF(filePath);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await parseDOCX(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    console.log('Parsed text length:', text.length);
    console.log('Attempting to save to MongoDB...');

    // Save to MongoDB
    const resume = await Resume.create({
      text,
      fileName: req.file.originalname
    });

    console.log('Successfully saved to MongoDB with ID:', resume._id);
    res.json({ message: 'Resume uploaded and parsed successfully', text, resumeId: resume._id });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to parse file' });
  }
});

// Endpoint for uploading job descriptions
app.post('/api/upload/jobDescription', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('Processing job description upload:', req.file.originalname);
    const filePath = req.file.path;
    let text = '';

    if (req.file.mimetype === 'application/pdf') {
      text = await parsePDF(filePath);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await parseDOCX(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    console.log('Parsed text length:', text.length);
    console.log('Attempting to save to MongoDB...');

    // Save to MongoDB
    const jobDescription = await JobDescription.create({
      text,
      fileName: req.file.originalname
    });

    console.log('Successfully saved to MongoDB with ID:', jobDescription._id);
    res.json({ message: 'Job description uploaded and parsed successfully', text, jobDescriptionId: jobDescription._id });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to parse file' });
  }
});

// Add endpoints to retrieve data
app.get('/api/resumes', async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadDate: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

app.delete('/api/resumes/:id', async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

app.get('/api/job-descriptions', async (req, res) => {
  try {
    const jobDescriptions = await JobDescription.find().sort({ uploadDate: -1 });
    res.json(jobDescriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job descriptions' });
  }
});

app.delete('/api/job-descriptions/:id', async (req, res) => {
  try {
    await JobDescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job description deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job description' });
  }
});

// Example function to generate ATS-friendly text
async function generateATSText(resumeText, jobDescription) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are an expert ATS resume optimization assistant with deep knowledge of hiring practices and resume optimization. 
Your task is to provide a comprehensive analysis of how well a resume matches a job description and offer specific improvements.
Structure your response in the following sections:

1. Match Score: Give a percentage match between the resume and job description
2. Key Skills Match: List matching skills and missing important skills
3. Experience Alignment: Analyze how well the experience matches job requirements
4. Keywords Analysis: Identify important ATS keywords present and missing
5. Specific Recommendations: Provide bullet-point suggestions for improving the resume
6. Format and Structure: Comment on ATS-friendliness of detectable resume structure`
        },
        {
          role: "user",
          content: `Please analyze the following resume against the job description:

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide a detailed analysis following the structure outlined in your instructions.`
        }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate analysis. Please try again.');
  }
}

// Test route for OpenAI integration
app.get('/test-openai', async (req, res) => {
  try {
    const sampleResume = "Software developer with 5 years of experience in web development";
    const sampleJobDescription = "Looking for a senior software developer with React and Node.js experience";
    
    const suggestions = await generateATSText(sampleResume, sampleJobDescription);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Error generating suggestions' });
  }
});

// Add analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    console.log('Received analysis request');
    
    if (!resumeText || !jobDescription) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Both resume and job description are required' });
    }

    console.log('Calling OpenAI API...');
    const analysis = await generateATSText(resumeText, jobDescription);
    console.log('Analysis generated successfully');
    console.log('Analysis result:', analysis);
    
    res.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze. Please try again.',
      details: error.message 
    });
  }
});

// Function to extract job description from URL
async function scrapeJobDescription(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Common selectors where job descriptions are typically found
    const selectors = [
      'div[class*="job-description"]',
      'div[class*="description"]',
      'div[class*="details"]',
      '#job-description',
      '[data-test="job-description"]',
      'div[class*="posting"]',
      'article'
    ];

    let content = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    if (!content) {
      // If no specific selectors match, try getting the main content
      content = $('main').text() || $('body').text();
    }

    return content.trim();
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw new Error('Failed to extract job description from URL');
  }
}

// Add URL endpoint for job descriptions
app.post('/api/job-descriptions/url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Scraping job description from URL:', url);
    const text = await scrapeJobDescription(url);
    
    if (!text) {
      return res.status(400).json({ error: 'Could not extract job description from URL' });
    }

    // Save to MongoDB
    const jobDescription = await JobDescription.create({
      text,
      fileName: `Job from ${new URL(url).hostname}`,
      sourceUrl: url
    });

    console.log('Successfully saved URL job description with ID:', jobDescription._id);
    res.json({ 
      message: 'Job description extracted and saved successfully', 
      text, 
      jobDescriptionId: jobDescription._id 
    });
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Failed to process URL' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});