// server/routes/users.js
const express = require('express');
const router = express.Router();

console.log('📦 users.js file is being executed');

router.get('/', (req, res) => {
  console.log('🧪 Inside /api/users route');
  res.send('✅ /api/users route reached');
});

router.get('/messages', (req, res) => {
  console.log('🧪 Inside /api/users/messages route');
  res.json([
    { id: 1, text: 'Welcome to SkillDemand!' },
    { id: 2, text: 'Your resume is being analyzed.' },
    { id: 3, text: 'Skill gap detected: React Hooks' }
  ]);
});
router.get('/messages/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(`🧪 Fetching messages for user ${userId}`);

  const messages = {
    1: [
      { id: 1, text: 'Welcome back, Karthik!' },
      { id: 2, text: 'Your resume is 90% optimized.' }
    ],
    2: [
      { id: 1, text: 'Hello, new user!' },
      { id: 2, text: 'Start by uploading your resume.' }
    ]
  };

  res.json(messages[userId] || []);
});

module.exports = router;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('resume'), (req, res) => {
  console.log('📄 Resume uploaded:', req.file.originalname);

  const analysis = {
    summary: 'Resume received and parsed.',
    skillsDetected: ['JavaScript', 'React', 'Node.js'],
    missingSkills: ['Docker', 'GraphQL'],
  };

  res.json(analysis);
});