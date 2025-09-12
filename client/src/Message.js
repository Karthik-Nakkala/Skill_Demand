import React, { useEffect, useState } from 'react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const userId = 1; // You can make this dynamic later

  useEffect(() => {
    fetch(`http://localhost:5050/api/users/messages/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('✅ Messages fetched for user:', data);
        setMessages(data);
      })
      .catch(err => {
        console.error('❌ Error fetching messages:', err);
      });
  }, []);

  return (
    <div>
      <h2>Messages for User {userId}:</h2>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;