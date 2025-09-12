const http = require('http');

http.get('http://localhost:5050/api/users', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Response from /api/users:', data);
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
});