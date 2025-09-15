import React, { useState } from 'react';
import SkillRadar from './SkillRadar';
import SkillProgress from './SkillProgress';
import ProgressChart from './ProgressChart';

const ResumeUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [aspiration, setAspiration] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const userId = localStorage.getItem('userId') || 'unknown';

  const handleUpload = async () => {
    if (!file || !aspiration) {
      alert('Please select a file and choose your target profession.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', userId);
    formData.append('aspiration', aspiration);

    try {
      const res = await fetch('http://localhost:5050/api/users/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('✅ Analysis result:', data);
      setAnalysis(data);
      setSelectedDomain('');
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.filename || 'resume-analysis'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Upload Your Resume</h2>

      <label>What profession are you targeting?</label>
      <select
        value={aspiration}
        onChange={e => setAspiration(e.target.value)}
        style={{ marginBottom: '10px' }}
      >
        <option value="">-- Select Profession --</option>
        <option value="Frontend Developer">Frontend Developer</option>
        <option value="Backend Developer">Backend Developer</option>
        <option value="Fullstack Developer">Fullstack Developer</option>
        <option value="Data Scientist">Data Scientist</option>
        <option value="Cloud Engineer">Cloud Engineer</option>
        <option value="UI/UX Designer">UI/UX Designer</option>
        <option value="Business Analyst">Business Analyst</option>
      </select>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Analyze</button>

      {analysis && (
        <div style={{ marginTop: '20px' }}>
          <h3>Analysis Summary:</h3>
          <p>{analysis.summary}</p>

          {/* ✅ Insight Highlights */}
          <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4>🔍 Insight Highlights:</h4>
            <ul>
              <li>
                <strong>Optimization Score:</strong> {analysis.aspirationCoverage}% match for {analysis.aspiration}
              </li>
              <li>
                <strong>Missing Skills:</strong> {
                  Object.values(analysis.filteredSuggestions)
                    .flat()
                    .slice(0, 4)
                    .join(', ') || 'None'
                }
              </li>
              <li>
                <strong>Top Recommendation:</strong> {
                  analysis.recommendations?.[0]
                    ? `${analysis.recommendations[0].skill}: ${analysis.recommendations[0].project}`
                    : 'No recommendations available'
                }
              </li>
            </ul>
          </div>

          {/* ✅ Structured Resume Fields */}
          {analysis.name && <p><strong>Name:</strong> {analysis.name}</p>}
          {analysis.email && <p><strong>Email:</strong> {analysis.email}</p>}

          {analysis.education?.length > 0 && (
            <>
              <h4>Education:</h4>
              <ul>
                {analysis.education.map((entry, idx) => (
                  <li key={idx}>
                    {entry
                      ? typeof entry === 'string'
                        ? entry
                        : `${entry.organization || ''} — ${entry.accomplishments?.join(', ') || ''}`
                      : '—'}
                  </li>
                ))}
              </ul>
            </>
          )}

          {analysis.experience?.length > 0 && (
            <>
              <h4>Experience:</h4>
              <ul>
                {analysis.experience.map((entry, idx) => (
                  <li key={idx}>
                    {entry
                      ? typeof entry === 'string'
                        ? entry
                        : `${entry.jobTitle || ''} at ${entry.organization || ''} — ${entry.accomplishments?.join(', ') || ''}`
                      : '—'}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ✅ Skills Detected */}
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

          {/* ✅ Visual skill coverage */}
          <SkillProgress analysis={analysis} />
          <SkillRadar analysis={analysis} />

          {/* ✅ Aspiration-based Upgrade Scopes */}
          {analysis.filteredSuggestions && Object.keys(analysis.filteredSuggestions).length > 0 && (
            <>
              <h4>Upgrade Scopes for {analysis.aspiration}:</h4>
              <label>Select a domain to explore missing skills:</label>
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                style={{ margin: '10px 0' }}
              >
                <option value="">-- Select Domain --</option>
                {Object.keys(analysis.filteredSuggestions).map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>

              {selectedDomain && analysis.filteredSuggestions[selectedDomain] && (
                <div style={{ marginTop: '10px' }}>
                  <strong>{selectedDomain}:</strong>
                  <ul>
                    {analysis.filteredSuggestions[selectedDomain].map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* ✅ Smart Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <>
              <h4>Smart Recommendations:</h4>
              <ul>
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <strong>{rec.skill}:</strong> {rec.project}
                  </li>
                ))}
              </ul>
            </>
          )}

            {/* ✅ Market Benchmark */}
{analysis.marketBenchmark && (
  <>
    <h4>📊 Market Benchmark:</h4>
    <ul>
      <li>
        <strong>Match Rate:</strong> {analysis.marketBenchmark.matchRate}% of {analysis.aspiration} roles match your profile
      </li>
      <li>
        <strong>Competitor Rank:</strong> You outperform {analysis.marketBenchmark.competitorRank}% of applicants
      </li>
      <li>
        <strong>Top Missing Market Skills:</strong> {analysis.marketBenchmark.missingMarketSkills.join(', ') || 'None'}
      </li>
    </ul>
  </>
)}

          {/* ✅ Progress Tracker */}
<ProgressChart uploads={analysis.uploadHistory || [analysis]} />

          {/* ✅ Download Button */}
          <button onClick={handleDownload} style={{ marginTop: '20px' }}>
            📥 Download Analysis Report
          </button>
          <button
  onClick={() => {
    const shareableURL = `http://localhost:3000/dashboard?user=${userId}`;
    navigator.clipboard.writeText(shareableURL);
    alert('🔗 Shareable link copied to clipboard!');
  }}
  style={{ marginTop: '10px' }}
>
  🔗 Copy Shareable Link
</button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;