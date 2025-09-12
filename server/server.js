// 🧠 SkillDemand backend starting from THIS server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Confirm route file exists using absolute path
const messagePath = path.join(__dirname, 'routes', 'message.js');
console.log('📁 Checking if message.js exists:', fs.existsSync(messagePath));

// ✅ Load and register routes
const messageRoutes = require(messagePath);
console.log('✅ message.js routes loaded');
app.use('/api', messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SkillDemand backend is running');
});
app.get('/api/users', (req, res) => {
  console.log('🧪 Direct /api/users route hit');
  res.send('Direct route working');
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});