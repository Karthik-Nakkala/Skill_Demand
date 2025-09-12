import React, { useState } from 'react';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('http://localhost:5050/api/users/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('✅ Analysis result:', data);
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  return (
    <div>
      <h2>Upload Your Resume</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Analyze</button>
    </div>
  );
};

export default ResumeUpload;