import React from 'react';

const SkillProgress = ({ analysis }) => {
  if (!analysis || typeof analysis.aspirationCoverage !== 'number') return null;

  const percent = analysis.aspirationCoverage;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Skill Coverage for {analysis.aspiration}</h3>
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
      <p>{percent}% of relevant skills detected</p>
    </div>
  );
};

export default SkillProgress;