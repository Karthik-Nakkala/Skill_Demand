import React, { useState } from 'react';
import Messages from './Message';
import ResumeUpload from './ResumeUpload';
import UploadHistory from './UploadHistory';

import './App.css';

function App() {
  const [refreshUploads, setRefreshUploads] = useState(false);
  const switchUser = (id) => {
    localStorage.setItem('userId', id);
    window.location.reload(); // Refresh to trigger new fetch
  };

  return (
    <div className="App">
      <h1>SkillDemand Dashboard</h1>

      {/* 🔄 User Switch Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => switchUser(1)}>Login as Karthik</button>
        <button onClick={() => switchUser(2)}>Login as New User</button>
      </div>

      <Messages />
      <ResumeUpload onUploadComplete={() => setRefreshUploads(prev => !prev)} />
      <UploadHistory key={refreshUploads} />
    </div>
  );
}

export default App;