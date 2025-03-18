const handleUrlSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    if (!url) {
      throw new Error('Please enter a URL');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Please enter a valid URL');
    }

    console.log('Submitting URL:', url);
    const response = await fetch('http://localhost:3003/api/job-descriptions/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url.trim() }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server error response:', data);
      throw new Error(data.message || 'Failed to process URL');
    }

    console.log('Successfully processed URL:', data);
    onUploadSuccess(data);
    setUrl('');
  } catch (error) {
    console.error('URL processing error:', error);
    setError(error.message || 'Failed to process URL. Please try again.');
  } finally {
    setLoading(false);
  }
}; 