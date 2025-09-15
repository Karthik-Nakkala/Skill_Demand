import React, { useState } from 'react';
import axios from 'axios';

export default function ResumeUploadForm() {
  const [file, setFile] = useState(null);
  const [aspiration, setAspiration] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file || !aspiration) return alert('Please select a file and aspiration');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('aspiration', aspiration);
    formData.append('userId', '1'); // temp userId

    try {
      const res = await axios.post('http://localhost:5000/upload', formData); // adjust port if needed
      setResult(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Resume upload failed. Check console for details.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>📄 Upload Your Resume</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <br /><br />
      <select onChange={e => setAspiration(e.target.value)} defaultValue="">
        <option value="" disabled>Select Aspiration</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Fullstack Developer">Fullstack Developer</option>
        <option value="Data Scientist">Data Scientist</option>
        <option value="Cloud Engineer">Cloud Engineer</option>
        <option value="UI/UX Designer">UI/UX Designer</option>
        <option value="Business Analyst">Business Analyst</option>
      </select>
      <br /><br />
      <button onClick={handleUpload}>Analyze Resume</button>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>🧠 Analysis Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}