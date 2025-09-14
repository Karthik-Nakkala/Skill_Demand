import React from 'react';

const SkillProgress = ({ analysis }) => {
  if (!analysis) return null;

  const detected = Array.isArray(analysis.skillsDetected) ? analysis.skillsDetected.length : 0;
  const missing = Array.isArray(analysis.missingSkills) ? analysis.missingSkills.length : 0;
  const totalSkills = detected + missing;
  const percent = totalSkills > 0 ? Math.round((detected / totalSkills) * 100) : 0;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Skill Coverage</h3>
      <div style={{ background: '#eee', height: '20px', borderRadius: '5px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percent}%`,
            background: '#4caf50',
            height: '100%',
            transition: 'width 0.5s ease'
          }}
        />
      </div>
      <p>{percent}% of known skills detected</p>
    </div>
  );
};

export default SkillProgress;