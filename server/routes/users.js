const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const pdfParse = require('pdf-parse');
const stopwords = require('stopwords').english;

console.log('📦 users.js file is being executed');

// In-memory store for uploaded resume analysis
const userResumes = {};

// Domain classification dictionary
const skillDomains = {
  WebDev: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'HTML', 'CSS'],
  DataScience: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn', 'TensorFlow', 'SQL'],
  Cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
  Design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator'],
  Business: ['Excel', 'Power BI', 'Agile', 'Scrum', 'JIRA', 'Confluence'],
  Backend: ['Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'GraphQL', 'MongoDB', 'MySQL', 'PostgreSQL']
};

// Keyword density function
function getKeywordDensity(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(word => word && !stopwords.includes(word));

  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return sorted.map(([word, count]) => ({ word, count }));
}

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

router.post('/upload', upload.single('resume'), async (req, res) => {
  console.log('🧾 req.body:', req.body);
  const userId = req.body.userId || 'unknown';
  const filename = req.file.originalname;
  const filePath = req.file.path;

  console.log(`📄 Resume uploaded by user ${userId}: ${filename}`);

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      console.error('❌ Resume text is empty or unreadable.');
      return res.status(500).json({ error: 'Failed to parse resume.' });
    }

    console.log('📄 Parsed resume preview:', text.slice(0, 500));

    // Dynamic skill detection
    const allSkills = require('../skills-dictionary.json');
    const skillsDetected = allSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Domain classification
    const domainScores = {};
    for (const domain in skillDomains) {
      const domainSkills = skillDomains[domain];
      const matched = domainSkills.filter(skill =>
        skillsDetected.includes(skill)
      );
      domainScores[domain] = matched.length;
    }

    // Top skills for display
    const topSkills = skillsDetected.slice(0, 20);

    // Keyword density
    const keywordDensity = getKeywordDensity(text);

    // Missing skills
    const missingSkills = allSkills.filter(skill =>
      !skillsDetected.includes(skill)
    );

    // Scope suggestions by domain
    const scopeSuggestions = {};
    for (const domain in skillDomains) {
      const domainSkills = skillDomains[domain];
      const missingInDomain = domainSkills.filter(skill =>
        !skillsDetected.includes(skill)
      );
      if (missingInDomain.length > 0) {
        scopeSuggestions[domain] = missingInDomain;
      }
    }

    const analysis = {
      summary: `Resume parsed successfully. Found ${skillsDetected.length} known skills.`,
      skillsDetected: topSkills,
      keywordDensity,
      domainScores,
      missingSkills,
      scopeSuggestions,
      filename
    };

    if (!userResumes[userId]) userResumes[userId] = [];
    userResumes[userId].push(analysis);
    console.log('📦 Stored resumes for user', userId, ':', userResumes[userId]);
    res.json(analysis);
  } catch (err) {
    console.error('❌ Error parsing PDF:', err);
    res.status(500).json({ error: 'Failed to parse resume.' });
  }
});

router.get('/uploads/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(`📂 Fetching uploads for user ${userId}`);
  res.json(userResumes[userId] || []);
});

module.exports = router;