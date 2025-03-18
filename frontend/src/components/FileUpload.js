import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = async (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const endpoint = type === 'cv' 
        ? `${process.env.REACT_APP_API_URL}/api/resumes/upload`
        : `${process.env.REACT_APP_API_URL}/api/job-descriptions/upload`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newDoc = {
        id: response.data.id,
        type,
        name: selectedFile.name,
        data: response.data,
        timestamp: new Date().toLocaleString()
      };

      setUploadedDocs(prev => [...prev, newDoc]);
      if (type === 'cv') setSelectedCV(newDoc.id);
      else setSelectedJob(newDoc.id);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || `Error uploading ${type === 'cv' ? 'CV' : 'job description'}`);
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
      const newDoc = {
        id: response.data.id,
        type: 'job',
        name: 'Job from URL',
        data: response.data,
        timestamp: new Date().toLocaleString(),
        url: url
      };
      setUploadedDocs(prev => [...prev, newDoc]);
      setSelectedJob(newDoc.id);
      setUrl('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing URL');
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!selectedCV || !selectedJob) {
      setError('Please select both a CV and a job description to compare');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/analyze`, {
        resumeId: selectedCV,
        jobDescriptionId: selectedJob
      });
      setAnalysisResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error analysing documents');
    }
    setLoading(false);
  };

  const renderDocumentList = (type) => {
    const docs = uploadedDocs.filter(doc => doc.type === type);
    if (docs.length === 0) return null;

    return (
      <div className="file-list">
        {docs.map((doc) => (
          <div 
            key={doc.id} 
            className={`file-item ${
              (type === 'cv' && selectedCV === doc.id) || 
              (type === 'job' && selectedJob === doc.id) ? 'selected' : ''
            }`}
            onClick={() => {
              if (type === 'cv') setSelectedCV(doc.id);
              else setSelectedJob(doc.id);
            }}
          >
            <input
              type="radio"
              name={`${type}-selection`}
              checked={
                (type === 'cv' && selectedCV === doc.id) ||
                (type === 'job' && selectedJob === doc.id)
              }
              onChange={() => {
                if (type === 'cv') setSelectedCV(doc.id);
                else setSelectedJob(doc.id);
              }}
            />
            <div className="file-item-icon">
              {type === 'cv' ? '📄' : '📋'}
            </div>
            <div className="file-item-details">
              <div className="file-item-name">{doc.name}</div>
              <div className="file-item-meta">{doc.timestamp}</div>
              {doc.url && (
                <div className="file-item-meta">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">View source</a>
                </div>
              )}
            </div>
            <button 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedDocs(prev => prev.filter(d => d.id !== doc.id));
                if (type === 'cv' && selectedCV === doc.id) setSelectedCV(null);
                if (type === 'job' && selectedJob === doc.id) setSelectedJob(null);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="analysis-result">
        <div className="match-score">
          <div className="score-circle">
            <h4>{analysisResult.matchScore}%</h4>
          </div>
        </div>

        <div className="keywords-analysis">
          <h4>Key skills match</h4>
          <div className="keyword-list">
            {analysisResult.matchingSkills?.map((skill, index) => (
              <span key={index} className="keyword-item">{skill}</span>
            ))}
          </div>
        </div>

        <div className="experience-alignment">
          <h4>Experience alignment</h4>
          <p>{analysisResult.experienceAlignment}</p>
        </div>

        <div className="recommendations">
          <h4>Recommendations</h4>
          <ol>
            {analysisResult.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ol>
        </div>

        <div className="format-structure">
          <h4>Format and structure</h4>
          <p>{analysisResult.formatFeedback}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="upload-container">
      <div className="upload-section">
        <h2>Upload résumé</h2>
        <label className="file-input-label">
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'cv')}
            accept=".pdf,.docx"
          />
          <span>Select a résumé</span>
        </label>
        {renderDocumentList('cv')}
      </div>

      <div className="upload-section">
        <h2>Upload job description</h2>
        <label className="file-input-label">
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'job')}
            accept=".docx"
          />
          <span>Select a job description</span>
        </label>
        <div className="url-section">
          <form onSubmit={handleUrlSubmit}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Or paste a job URL"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Submit URL'}
            </button>
          </form>
        </div>
        {renderDocumentList('job')}
      </div>

      {(uploadedDocs.filter(d => d.type === 'cv').length > 0 && 
        uploadedDocs.filter(d => d.type === 'job').length > 0) && (
        <button 
          onClick={handleAnalyze}
          disabled={loading || !selectedCV || !selectedJob}
          className="compare-button"
        >
          {loading ? 'Analysing...' : 'Compare Match'}
        </button>
      )}

      {error && <div className="error">{error}</div>}
      
      {renderAnalysisResult()}
    </div>
  );
};

export default FileUpload; 