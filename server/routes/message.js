const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
  console.log('✅ /api/users route was hit');
  res.json({
    users: [
      { id: 1, name: 'Karthik Yadav' },
      { id: 2, name: 'Aarav Mehta' },
      { id: 3, name: 'Isha Reddy' }
    ]
  });
});

module.exports = router;