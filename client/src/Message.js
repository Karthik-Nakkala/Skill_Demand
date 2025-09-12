import React, { useEffect, useState } from 'react';

const Message = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5050/api/users')
      .then(res => res.text())
      .then(data => {
        console.log('✅ Fetched from backend:', data);
        setMessage(data);
      })
      .catch(err => {
        console.error('❌ Error fetching:', err);
      });
  }, []);

  return (
    <div>
      <h2>Backend Response:</h2>
      <p>{message}</p>
    </div>
  );
};

export default Message;