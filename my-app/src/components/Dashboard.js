import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FileUpload from './FileUpload';
import FileList from './FileList';

// Helper function to extract match percentage from analysis text
const extractMatchScore = (analysisText) => {
  const matchRegex = /Match Score:.*?(\d+)%/;
  const match = analysisText.match(matchRegex);
  return match ? parseInt(match[1]) : 0;
};

// Helper function to split analysis into sections
const splitAnalysisSections = (analysisText) => {
  const sections = {
    matchScore: '',
    keySkills: '',
    experienceAlignment: '',
    keywordsAnalysis: '',
    recommendations: '',
    format: ''
  };

  const lines = analysisText.split('\n');
  let currentSection = '';

  lines.forEach(line => {
    if (line.includes('Match Score:')) {
      currentSection = 'matchScore';
    } else if (line.includes('Key Skills Match:')) {
      currentSection = 'keySkills';
    } else if (line.includes('Experience Alignment:')) {
      currentSection = 'experienceAlignment';
    } else if (line.includes('Keywords Analysis:')) {
      currentSection = 'keywordsAnalysis';
    } else if (line.includes('Specific Recommendations:')) {
      currentSection = 'recommendations';
    } else if (line.includes('Format and Structure:')) {
      currentSection = 'format';
    }

    if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  });

  return sections;
};

const Dashboard = () => {
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobFiles, setJobFiles] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJobDescription, setSelectedJobDescription] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sections, setSections] = useState(null);
  const [matchScore, setMatchScore] = useState(0);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      // Fetch resumes
      const resumesResponse = await fetch('http://localhost:3003/api/resumes');
      const resumesData = await resumesResponse.json();
      setResumeFiles(resumesData);

      // Fetch job descriptions
      const jobsResponse = await fetch('http://localhost:3003/api/job-descriptions');
      const jobsData = await jobsResponse.json();
      setJobFiles(jobsData);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleResumeUpload = (data) => {
    setSelectedResume(data);
    fetchFiles();
  };

  const handleJobDescriptionUpload = (data) => {
    setSelectedJobDescription(data);
    fetchFiles();
  };

  const handleAnalyze = async () => {
    if (!selectedResume || !selectedJobDescription) {
      alert('Please select both a resume and a job description to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('Sending analysis request...');
      console.log('Resume:', selectedResume.fileName);
      console.log('Job Description:', selectedJobDescription.fileName);
      
      const response = await fetch('http://localhost:3003/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: selectedResume.text,
          jobDescription: selectedJobDescription.text
        })
      });

      const result = await response.json();
      console.log('Received response:', result);
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Analysis failed');
      }
      
      console.log('Analysis result length:', result.analysis?.length);
      setAnalysisResult(result.analysis);
      
      console.log('Parsing sections...');
      const newSections = splitAnalysisSections(result.analysis);
      console.log('Parsed sections:', newSections);
      setSections(newSections);
      
      const score = extractMatchScore(result.analysis);
      console.log('Extracted match score:', score);
      setMatchScore(score);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Failed to analyze: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ATS Resume Optimizer
        </Typography>
        
        <FileUpload type="resume" onUpload={handleResumeUpload} />
        <FileList 
          type="resume" 
          files={resumeFiles}
          selectedFile={selectedResume}
          onSelect={setSelectedResume}
          onDelete={fetchFiles}
        />
        
        <FileUpload type="jobDescription" onUpload={handleJobDescriptionUpload} />
        <FileList 
          type="jobDescription"
          files={jobFiles}
          selectedFile={selectedJobDescription}
          onSelect={setSelectedJobDescription}
          onDelete={fetchFiles}
        />

        <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            disabled={!selectedResume || !selectedJobDescription || isAnalyzing}
            startIcon={isAnalyzing ? <CircularProgress size={20} /> : <CompareArrowsIcon />}
            sx={{ mb: 2 }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          </Button>

          {/* Debug Tools Section - Adding with simpler styling */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
              Debug Tools
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log("Running test analysis...");
                  const testText = `Match Score: 85%
Key Skills Match: Strong match in project management
Experience Alignment: 5 years of relevant experience
Keywords Analysis: Found key terms like Agile, Scrum
Specific Recommendations: Add more quantifiable achievements
Format and Structure: Well structured resume`;
                  const sections = splitAnalysisSections(testText);
                  console.log("Test sections:", sections);
                }}
              >
                Test Parser
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  console.log("Current State:", {
                    selectedResume,
                    selectedJobDescription,
                    files: { resumeFiles, jobFiles }
                  });
                }}
              >
                Log State
              </Button>
            </Box>
          </Box>

          {selectedResume && selectedJobDescription && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Analyzing {selectedResume.fileName} against {selectedJobDescription.fileName}
            </Typography>
          )}

          {analysisResult && sections && (
            <Box sx={{ mt: 3 }}>
              {/* Match Score Circle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={matchScore}
                    size={120}
                    thickness={4}
                    sx={{ color: getScoreColor(matchScore) }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary">
                      {matchScore}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Analysis Sections */}
              <Grid container spacing={3}>
                {/* Key Skills */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Key Skills Match
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                        {sections.keySkills}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Experience Alignment */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Experience Alignment
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                        {sections.experienceAlignment}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Keywords Analysis */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Keywords Analysis
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                        {sections.keywordsAnalysis}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recommendations
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                        {sections.recommendations}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Format and Structure */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Format and Structure
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                        {sections.format}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;