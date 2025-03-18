import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file');
    }
    setLoading(false);
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting URL:', url);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/job-descriptions/url`, { url });
      console.log('Response:', response.data);
      setResult(response.data);
      setError('');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error processing URL');
    }
    setLoading(false);
  };

  return (
    <div className="upload-container">
      <div className="upload-section">
        <h2>Upload Resume</h2>
        <form onSubmit={handleFileSubmit}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="upload-section">
        <h2>Submit Job Description URL</h2>
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter job posting URL"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="result">
          <h3>Results:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 