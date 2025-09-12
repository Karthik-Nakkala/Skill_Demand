// server/routes/users.js
const express = require('express');
const router = express.Router();

console.log('📦 users.js file is being executed');

router.get('/', (req, res) => {
  console.log('🧪 Inside /api/users route');
  res.send('✅ /api/users route reached');
});

module.exports = router;