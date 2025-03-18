import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';

const FileUpload = ({ type, onUpload, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = type === 'resume' ? '/api/upload/resume' : '/api/upload/jobDescription';
      const response = await fetch(`http://localhost:3003${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('http://localhost:3003/api/job-descriptions/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to process URL');
      }

      onUpload(data);
      if (onUploadComplete) {
        onUploadComplete();
      }
      setUrl(''); // Clear the URL input after successful submission
    } catch (error) {
      console.error('URL processing error:', error);
      // Show a more informative error message
      alert(error.message || 'Failed to process URL. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Only show URL option for job descriptions
  const showUrlOption = type === 'jobDescription';

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload {type === 'resume' ? 'résumé' : 'job description'}
      </Typography>

      {showUrlOption && (
        <Tabs
          value={uploadMethod}
          onChange={(e, newValue) => setUploadMethod(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Upload file" value="file" icon={<CloudUploadIcon />} />
          <Tab label="Add URL" value="url" icon={<LinkIcon />} />
        </Tabs>
      )}

      {uploadMethod === 'file' ? (
        <Button
          variant="outlined"
          component="label"
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          sx={{ width: '100%', height: '100px', textTransform: 'none' }}
        >
          {uploading ? 'Uploading...' : `Select a ${type === 'resume' ? 'résumé' : 'job description'}`}
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
        </Button>
      ) : (
        <Box component="form" onSubmit={handleUrlSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Enter job posting URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={uploading}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={uploading || !url.trim()}
            startIcon={uploading ? <CircularProgress size={20} /> : <LinkIcon />}
            sx={{ textTransform: 'none' }}
          >
            {uploading ? 'Processing...' : 'Extract description'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;