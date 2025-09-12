const express = require('express');
const app = express();
const PORT = 5050;

// ✅ Confirm this file is running
console.log('🧨 Confirmed: THIS server.js is running');

// ✅ Import and use the message router
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// ✅ Minimal route
app.get('/api/status', (req, res) => {
  console.log('🧪 /api/status route hit');
  res.json({
    service: 'SkillDemand',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Minimal server running on port ${PORT}`);
});