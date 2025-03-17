import React, { useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import FileUpload from './FileUpload';
import FileList from './FileList';

const Dashboard = () => {
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);

  const handleResumeUpload = (data) => {
    setResumeData(data);
  };

  const handleJobDescriptionUpload = (data) => {
    setJobDescription(data);
  };

  function splitAnalysisSections(analysisText) {
    console.log("splitAnalysisSections called with:", {
      received: !!analysisText,
      type: typeof analysisText,
      length: analysisText?.length
    });

    if (!analysisText) {
      console.error("Analysis text is undefined or null");
      return [];
    }

    if (typeof analysisText !== 'string') {
      console.error("Analysis text is not a string:", typeof analysisText);
      return [];
    }

    try {
      console.log("Starting to process analysis text:", {
        length: analysisText.length,
        preview: analysisText.substring(0, 100)
      });
      
      // Initialize arrays for sections
      const sections = [];
      let currentSection = null;
      
      // Split into lines and filter out empty ones
      const lines = analysisText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      console.log("Processing lines:", {
        totalLines: lines.length,
        firstLine: lines[0],
        lastLine: lines[lines.length - 1]
      });
      
      // Process each line
      lines.forEach((line, index) => {
        // Check if this is a section header (starts with number and dot)
        const isSectionHeader = /^\d+\./.test(line);
        
        if (isSectionHeader) {
          console.log(`Found section header at line ${index}:`, line);
          // If we have a previous section, save it
          if (currentSection) {
            sections.push({
              ...currentSection,
              content: currentSection.content.join('\n')
            });
          }
          
          // Start new section
          currentSection = {
            title: line,
            content: []
          };
        } else if (currentSection) {
          // Add line to current section's content
          currentSection.content.push(line);
        } else {
          console.log("Found content before first section:", line);
        }
      });
      
      // Don't forget to add the last section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentSection.content.join('\n')
        });
      }
      
      console.log("Section processing complete:", {
        numberOfSections: sections.length,
        sections: sections.map(s => ({ title: s.title, contentLength: s.content.length }))
      });
      
      return sections;
      
    } catch (error) {
      console.error("Error in splitAnalysisSections:", {
        error: error.message,
        stack: error.stack,
        analysisTextType: typeof analysisText,
        analysisTextLength: analysisText?.length
      });
      return [];
    }
  }

  // Add this new test function
  function testAnalysis() {
    console.log("🔍 Starting test...");
    
    // Test 1: Empty input
    console.log("Test 1: Empty input");
    const result1 = splitAnalysisSections();
    console.log("Result 1:", result1);
    
    // Test 2: Simple string input
    console.log("\nTest 2: Simple string input");
    const simpleText = "1. First Section\nThis is content\n2. Second Section\nMore content";
    const result2 = splitAnalysisSections(simpleText);
    console.log("Result 2:", result2);
  }

  // Add a button to run the test
  const runTest = () => {
    console.log("🚀 Running test function...");
    testAnalysis();
  };

  async function handleAnalyze() {
    try {
      console.log("Step 1: Starting analysis...");
      
      if (!resumeData?.text || !jobDescription?.text) {
        throw new Error("Please upload both resume and job description files");
      }

      console.log("Step 2: Sending request to server...");
      const response = await fetch('http://localhost:3003/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: resumeData.text,
          jobDescription: jobDescription.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const rawResult = await response.json();
      console.log("Raw server response:", rawResult);

      // Ensure we have a valid response with analysis
      if (!rawResult || typeof rawResult !== 'object') {
        throw new Error('Invalid server response format');
      }

      const analysisText = rawResult.analysis;
      
      if (!analysisText || typeof analysisText !== 'string') {
        console.error("Invalid analysis text:", analysisText);
        throw new Error('Invalid analysis text received from server');
      }

      console.log("Analysis text received:", {
        length: analysisText.length,
        preview: analysisText.substring(0, 100)
      });

      // Try to split the sections
      const sections = splitAnalysisSections(analysisText);
      
      if (!sections || !Array.isArray(sections)) {
        throw new Error('Failed to parse analysis sections');
      }

      console.log("Successfully parsed sections:", sections);
      
      // TODO: Update UI with sections
      return sections;
      
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error.message}`);
      return [];
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ATS Resume Optimizer
        </Typography>
        
        <FileUpload type="resume" onUpload={handleResumeUpload} />
        <FileList type="resume" />
        
        <FileUpload type="jobDescription" onUpload={handleJobDescriptionUpload} />
        <FileList type="jobDescription" />

        {/* Main Analysis Button */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            startIcon={<span role="img" aria-label="analyze">✈️</span>}
          >
            ANALYZE RESUME
          </Button>
        </Box>

        {/* Debug Tools Section */}
        <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom align="center" sx={{ color: '#666' }}>
            Debug Tools
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={runTest}
              sx={{ fontSize: '0.8rem' }}
            >
              Test Parser
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => console.log({ resumeData, jobDescription })}
              sx={{ fontSize: '0.8rem' }}
            >
              Log State
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 