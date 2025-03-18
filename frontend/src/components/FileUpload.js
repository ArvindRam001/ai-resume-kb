import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleJobFileChange = (e) => {
    setJobFile(e.target.files[0]);
    setError('');
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CV file');
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
      setUploadedDocs(prev => [...prev, { type: 'cv', name: file.name, data: response.data }]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading CV');
    }
    setLoading(false);
  };

  const handleJobFileSubmit = async (e) => {
    e.preventDefault();
    if (!jobFile) {
      setError('Please select a job description file');
      return;
    }

    const formData = new FormData();
    formData.append('file', jobFile);

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/job-descriptions/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      setUploadedDocs(prev => [...prev, { type: 'job', name: jobFile.name, data: response.data }]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading job description');
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/job-descriptions/url`, { url });
      setResult(response.data);
      setUploadedDocs(prev => [...prev, { type: 'job', name: 'Job from URL', data: response.data }]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing URL');
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    const resume = uploadedDocs.find(doc => doc.type === 'resume');
    const jobDesc = uploadedDocs.find(doc => doc.type === 'job');

    if (!resume || !jobDesc) {
      setError('Please upload both a resume and a job description before analyzing');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze`, {
        resumeId: resume.data.id,
        jobDescriptionId: jobDesc.data.id
      });
      setAnalysisResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing documents');
    }
    setLoading(false);
  };

  const renderUploadedDocs = () => {
    if (uploadedDocs.length === 0) return null;

    return (
      <div className="uploaded-docs">
        <h3>Uploaded Documents</h3>
        <ul>
          {uploadedDocs.map((doc, index) => (
            <li key={index}>
              {doc.name} ({doc.type})
              <button 
                className="remove-btn"
                onClick={() => setUploadedDocs(prev => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="analysis-result">
        <h3>Analysis Results</h3>
        <div className="match-score">
          <h4>Match Score: {analysisResult.matchScore}%</h4>
        </div>
        <div className="matching-skills">
          <h4>Matching Skills</h4>
          <ul>
            {analysisResult.matchingSkills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="missing-skills">
          <h4>Missing Skills</h4>
          <ul>
            {analysisResult.missingSkills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
        <div className="recommendations">
          <h4>Recommendations</h4>
          <p>{analysisResult.recommendations}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      <div className="upload-section">
        <h2>Upload CV</h2>
        <form onSubmit={handleFileSubmit}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload CV'}
          </button>
        </form>
      </div>

      <div className="upload-section">
        <h2>Upload Job Description</h2>
        <form onSubmit={handleJobFileSubmit}>
          <input
            type="file"
            onChange={handleJobFileChange}
            accept=".docx"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Job Description'}
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
            {loading ? 'Processing...' : 'Submit URL'}
          </button>
        </form>
      </div>

      {renderUploadedDocs()}

      {uploadedDocs.length >= 2 && (
        <div className="analyze-section">
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-btn"
          >
            {loading ? 'Analysing...' : 'Analyse Match'}
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      
      {renderAnalysisResult()}
    </div>
  );
};

export default FileUpload; 