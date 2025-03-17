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

const FileUpload = ({ type, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`http://localhost:3003/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

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
        throw new Error(data.error || 'Failed to process URL');
      }

      onUpload(data);
      setUrl(''); // Clear the URL input after successful submission
    } catch (error) {
      console.error('URL processing error:', error);
      alert('Failed to process URL. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Only show URL option for job descriptions
  const showUrlOption = type === 'jobDescription';

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload {type === 'resume' ? 'Resume' : 'Job Description'}
      </Typography>

      {showUrlOption && (
        <Tabs
          value={uploadMethod}
          onChange={(e, newValue) => setUploadMethod(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Upload File" value="file" icon={<CloudUploadIcon />} />
          <Tab label="Paste URL" value="url" icon={<LinkIcon />} />
        </Tabs>
      )}

      {uploadMethod === 'file' ? (
        <Button
          variant="outlined"
          component="label"
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          sx={{ width: '100%', height: '100px' }}
        >
          {uploading ? 'Uploading...' : `Choose ${type === 'resume' ? 'Resume' : 'Job Description'}`}
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
            label="Paste job posting URL"
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
          >
            {uploading ? 'Processing...' : 'Extract Job Description'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;