// Trigger Vercel redeploy with updated environment variables
import React from 'react';
import './App.css';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI CV Analyser</h1>
        <p>Upload your CV or job description URL to get started</p>
      </header>
      <main>
        <FileUpload />
      </main>
    </div>
  );
}

export default App;
