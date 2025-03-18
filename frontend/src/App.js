// Trigger Vercel redeploy with updated environment variables
import React from 'react';
import './App.css';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Resume Analyzer</h1>
        <p>Upload your resume or job description URL to get started</p>
      </header>
      <main>
        <FileUpload />
      </main>
    </div>
  );
}

export default App;
