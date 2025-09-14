import React, { useState } from 'react';
import SkillRadar from './SkillRadar';
import SkillProgress from './SkillProgress';

const ResumeUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const userId = localStorage.getItem('userId') || 'unknown';

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('http://localhost:5050/api/users/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('✅ Analysis result:', data);
      setAnalysis(data);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  return (
    <div>
      <h2>Upload Your Resume</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Analyze</button>

      {analysis && (
        <div style={{ marginTop: '20px' }}>
          <h3>Analysis Summary:</h3>
          <p>{analysis.summary}</p>

          {Array.isArray(analysis.skillsDetected) && analysis.skillsDetected.length > 0 && (
            <>
              <h4>Skills Detected:</h4>
              <ul>
                {analysis.skillsDetected.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </>
          )}

          {Array.isArray(analysis.missingSkills) && analysis.missingSkills.length > 0 && (
            <>
              <h4>Missing Skills:</h4>
              <ul>
                {analysis.missingSkills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ Visual skill coverage */}
          <SkillProgress analysis={analysis} />
          <SkillRadar analysis={analysis} />

          {/* ✅ Upgrade Scopes by Domain */}
          {analysis.scopeSuggestions && Object.keys(analysis.scopeSuggestions).length > 0 && (
            <>
              <h4>Upgrade Scopes:</h4>
              {Object.entries(analysis.scopeSuggestions).map(([domain, skills]) => (
                <div key={domain} style={{ marginBottom: '10px' }}>
                  <strong>{domain}:</strong>
                  <ul>
                    {skills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;