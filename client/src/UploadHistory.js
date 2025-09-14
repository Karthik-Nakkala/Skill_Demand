import React, { useEffect, useState } from 'react';

const UploadHistory = () => {
  const [uploads, setUploads] = useState([]);
  const userId = localStorage.getItem('userId') || 'unknown';

  useEffect(() => {
    fetch(`http://localhost:5050/api/users/uploads/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('📂 Upload history:', data);
        setUploads(data);
      })
      .catch(err => {
        console.error('❌ Error fetching uploads:', err);
      });
  }, []);

  return (
    <div>
      <h2>Upload History for User {userId}</h2>
      {uploads.length === 0 ? (
        <p>No uploads found.</p>
      ) : (
        <ul>
          {uploads.map((upload, idx) => (
            <li key={idx}>
              <strong>{upload.filename}</strong> — {upload.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadHistory;