const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const stopwords = require('stopwords').english;
const axios = require('axios');
const FormData = require('form-data');

console.log('📦 users.js file is being executed');

// Resume parsing via Affinda API
async function parseWithAffinda(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await axios.post('https://api.affinda.com/v2/resumes', form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': 'Bearer aff_39b2709c21e26bf30399e5cdad6a2e8df37e893b'
    }
  });

  console.log('📨 Affinda raw response:', response.data);
  return response.data;
}

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

// Aspiration-to-domain mapping
const aspirationDomains = {
  'Frontend Developer': ['WebDev', 'Design'],
  'Backend Developer': ['Backend', 'Cloud'],
  'Fullstack Developer': ['WebDev', 'Backend', 'Cloud'],
  'Data Scientist': ['DataScience', 'Cloud'],
  'Cloud Engineer': ['Cloud', 'Backend'],
  'UI/UX Designer': ['Design', 'WebDev'],
  'Business Analyst': ['Business', 'DataScience']
};

// Smart project ideas for missing skills
const skillProjects = {
  Docker: 'Build and containerize a Node.js API using Docker Compose.',
  Go: 'Create a RESTful API in Go with Gorilla Mux and deploy it on Docker.',
  GraphQL: 'Build a GraphQL server with Apollo and connect it to MongoDB.',
  AWS: 'Deploy a static site to AWS S3 and set up CloudFront for CDN.',
  Figma: 'Design a mobile app UI in Figma and export assets for React Native.',
  TensorFlow: 'Train a simple image classifier using TensorFlow and visualize results.',
  PowerBI: 'Create a dashboard in Power BI using sample sales data.',
  MongoDB: 'Build a CRUD app with Express and MongoDB Atlas.',
  Rust: 'Write a CLI tool in Rust that parses and analyzes text files.'
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

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

// Normalize skill names to a standard format
function normalizeSkill(word) {
  const skillMap = {
    // JavaScript ecosystem
    'nodejs': 'Node.js', 'node': 'Node.js', 'node.js': 'Node.js',
    'reactjs': 'React', 'react.js': 'React',
    'js': 'JavaScript', 'javascript': 'JavaScript',
    'ts': 'TypeScript', 'typescript': 'TypeScript',
    'nextjs': 'Next.js', 'next.js': 'Next.js',
    'express': 'Express.js', 'expressjs': 'Express.js',
    'vue': 'Vue.js', 'vuejs': 'Vue.js', 'vue.js': 'Vue.js',
    'angular': 'Angular', 'angularjs': 'Angular',
    
    // Databases
    'sql': 'SQL', 'mysql': 'MySQL', 'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB', 'mongo': 'MongoDB',
    'redis': 'Redis', 'firebase': 'Firebase',
    
    // Cloud & DevOps
    'aws': 'AWS', 'amazon web services': 'AWS',
    'azure': 'Azure', 'google cloud': 'GCP', 'gcp': 'GCP',
    'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
    'jenkins': 'Jenkins', 'terraform': 'Terraform',
    
    // General
    'html': 'HTML', 'css': 'CSS', 'git': 'Git',
    'graphql': 'GraphQL', 'rest': 'REST API',
    'linux': 'Linux', 'bash': 'Bash', 'shell': 'Shell',
    
    // Data Science
    'tensorflow': 'TensorFlow', 'pandas': 'Pandas', 'numpy': 'NumPy',
    'pytorch': 'PyTorch', 'matplotlib': 'Matplotlib', 'seaborn': 'Seaborn',
    
    // Programming Languages
    'python': 'Python', 'java': 'Java', 'csharp': 'C#', 'c++': 'C++',
    'ruby': 'Ruby', 'php': 'PHP', 'swift': 'Swift', 'kotlin': 'Kotlin',
    'go': 'Go', 'golang': 'Go', 'rust': 'Rust',
    
    // Remove common non-skills
    'experience': null, 'role': null, 'developer': null, 
    'company': null, 'team': null, 'work': null,
    'development': null, 'technology': null, 'systems': null,
    'full': null, 'ibm': null, 'software': null, 'engineer': null,
    'application': null, 'applications': null, 'using': null,
    'based': null, 'including': null, 'within': null
  };
  
  const normalized = skillMap[word.toLowerCase()] || word;
  // Only return if it's a valid skill (not null and not the original word if it's too short/generic)
  return normalized && normalized.length > 2 ? normalized : null;
}

// Get weighted market skills with proper filtering
async function getWeightedMarketSkills(role = 'Backend Developer', location = 'India') {
  try {
    const app_id = '9021c1fe';
    const app_key = '071de561774902fb5e69d180bb4b528a';
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${app_id}&app_key=${app_key}&what=${encodeURIComponent(role)}&where=${encodeURIComponent(location)}`;

    const response = await axios.get(url);
    const jobs = response.data.results || [];
    const weightedSkills = {};

    // First pass: count all skills
    jobs.forEach(job => {
      const words = job.description
        .toLowerCase()
        .match(/\b[a-zA-Z+#]{2,}\b/g) || []; // Include languages like C#
      
      words.forEach(word => {
        const normalized = normalizeSkill(word);
        if (normalized) {
          weightedSkills[normalized] = (weightedSkills[normalized] || 0) + 1;
        }
      });
    });

    return weightedSkills;
  } catch (error) {
    console.error('Error fetching market skills:', error);
    return {}; // Return empty object on error
  }
}

// Calculate market match metrics
function calculateMarketMetrics(userSkills, marketSkills) {
  const marketSkillEntries = Object.entries(marketSkills);
  const totalWeight = marketSkillEntries.reduce((sum, [, weight]) => sum + weight, 0);
  
  // Calculate matched weight (only for skills user actually has)
  const matchedWeight = marketSkillEntries
    .filter(([skill]) => userSkills.includes(skill))
    .reduce((sum, [, weight]) => sum + weight, 0);
  
  // Calculate match rate (0-100%)
  const matchRate = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  
  // Get top missing skills (most frequently requested skills user doesn't have)
  const missingMarketSkills = marketSkillEntries
    .filter(([skill]) => !userSkills.includes(skill))
    .sort((a, b) => b[1] - a[1]) // Sort by frequency descending
    .slice(0, 5) // Top 5
    .map(([skill]) => skill);
  
  return { matchRate, missingMarketSkills };
}

// Error function approximation for normal distribution
function erf(x) {
  // Save the sign of x
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);
  
  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

// Calculate competitor rank based on match rate distribution simulation
function calculateCompetitorRank(matchRate) {
  // Simulate a normal distribution of competitor match rates
  // Assuming most applicants cluster around 40-70% match rate
  const mean = 55; // Average match rate
  const stdDev = 15; // Standard deviation
  
  // Calculate percentile using normal distribution CDF approximation
  const z = (matchRate - mean) / stdDev;
  const percentile = 100 * (0.5 * (1 + erf(z / Math.sqrt(2))));
  
  // Ensure logical consistency: 0% match rate → 0% rank, 100% match rate → 100% rank
  const adjustedPercentile = Math.max(0, Math.min(100, Math.round(percentile)));
  
  return adjustedPercentile;
}

// ✅ Resume upload and analysis route
router.post('/upload', upload.single('resume'), async (req, res) => {
  const userId = req.body.userId || 'unknown';
  const aspiration = req.body.aspiration || '';
  const filename = req.file.originalname;
  const filePath = req.file.path;

  try {
    const affindaData = await parseWithAffinda(filePath);
    const structured = affindaData.data;

    if (!structured || !structured.name || !structured.rawText) {
      console.error('❌ Affinda returned incomplete data:', affindaData);
      return res.status(500).json({ error: 'Affinda failed to parse resume.' });
    }

    const name = structured.name?.raw || '';
    const email = structured.contact?.email || '';
    const education = structured.education?.map(e => e.text) || [];
    const experience = structured.workExperience?.map(e => e.text) || [];
    const text = structured.rawText || '';

    const allSkills = require('../skills-dictionary.json');
    const skillsDetected = allSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    const domainScores = {};
    for (const domain in skillDomains) {
      const domainSkills = skillDomains[domain];
      const matched = domainSkills.filter(skill => skillsDetected.includes(skill));
      domainScores[domain] = matched.length;
    }

    const topSkills = skillsDetected.slice(0, 20);
    const keywordDensity = getKeywordDensity(text);
    const missingSkills = allSkills.filter(skill => !skillsDetected.includes(skill));

    const scopeSuggestions = {};
    for (const domain in skillDomains) {
      const domainSkills = skillDomains[domain];
      const missingInDomain = domainSkills.filter(skill => !skillsDetected.includes(skill));
      if (missingInDomain.length > 0) {
        scopeSuggestions[domain] = missingInDomain;
      }
    }

    const relevantDomains = aspirationDomains[aspiration] || [];
    const filteredSuggestions = {};
    const aspirationDomainScores = {};
    let totalAspirationSkills = 0;
    let totalMatched = 0;

    relevantDomains.forEach(domain => {
      const domainSkills = skillDomains[domain];
      const matched = domainSkills.filter(skill => skillsDetected.includes(skill));
      const missing = domainSkills.filter(skill => !skillsDetected.includes(skill));
      aspirationDomainScores[domain] = matched.length;
      totalAspirationSkills += domainSkills.length;
      totalMatched += matched.length;
      if (missing.length > 0) {
        filteredSuggestions[domain] = missing;
      }
    });

    const aspirationCoverage = totalAspirationSkills > 0
      ? Math.round((totalMatched / totalAspirationSkills) * 100)
      : 0;

    const recommendations = [];
    Object.values(filteredSuggestions).forEach(skillList => {
      skillList.forEach(skill => {
        if (skillProjects[skill]) {
          recommendations.push({ skill, project: skillProjects[skill] });
        }
      });
    });

    // Calculate market benchmark with the new algorithm
    const weightedMarketSkills = await getWeightedMarketSkills(aspiration, 'India');
    const { matchRate, missingMarketSkills } = calculateMarketMetrics(
      skillsDetected, 
      weightedMarketSkills
    );

    const competitorRank = calculateCompetitorRank(matchRate);

    // Ensure logical consistency
    const consistentMatchRate = matchRate;
    const consistentCompetitorRank = matchRate === 0 ? 0 : competitorRank;

    const analysis = {
      summary: `Resume parsed successfully. Found ${skillsDetected.length} known skills.`,
      skillsDetected: topSkills,
      keywordDensity,
      domainScores,
      aspirationDomainScores,
      aspirationCoverage,
      filteredSuggestions,
      recommendations,
      aspiration,
      filename,
      name,
      email,
      education,
      experience,
      marketBenchmark: {
        matchRate: consistentMatchRate,
        competitorRank: consistentCompetitorRank,
        missingMarketSkills: missingMarketSkills.length > 0 ? 
          missingMarketSkills : ["No significant skill gaps detected"]
      }
    };

    if (!userResumes[userId]) userResumes[userId] = [];
    userResumes[userId].push(analysis);
    res.json(analysis);
  } catch (err) {
    console.error('❌ Resume parsing failed:', err.message);
    if (err.response) {
      console.error('📨 Affinda error response:', err.response.data);
    }
    res.status(500).json({ error: 'Failed to parse resume.' });
  }
});

// ✅ GET route for messages
router.get('/messages/:userId', (req, res) => {
  const { userId } = req.params;
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

// ✅ GET route for uploads
router.get('/uploads/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(userResumes[userId] || []);
});

module.exports = router;