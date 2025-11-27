const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Data file path
const dataFilePath = path.join(__dirname, 'data', 'projects.json');

// Ensure data directory exists
const dataDir = path.dirname(dataFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper functions for file operations
const readProjects = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Ошибка чтения проектов:', error);
  }
  return [];
};

const writeProjects = (projects) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(projects, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения проектов:', error);
    return false;
  }
};

// Initialize with sample data if empty
const initializeSampleData = () => {
  const projects = readProjects();
  if (projects.length === 0) {
    const sampleProjects = [
      {
        id: uuidv4(),
        name: "Умная мобильность",
        industry: "Транспорт",
        инвестиционнаяОценка: 68,
        транспортнаяОценка: 8,
        status: "Рекомендовано к полной оценке",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: "Билетная система с ИИ",
        industry: "Транспорт",
        инвестиционнаяОценка: 61,
        транспортнаяОценка: 5,
        status: "Только инвестиции",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: "Экологичная парковка",
        industry: "Транспорт",
        инвестиционнаяОценка: 52,
        транспортнаяОценка: 7,
        status: "Только пилот",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    writeProjects(sampleProjects);
    console.log('Примеры данных инициализированы');
  }
};

// Routes

// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const projects = readProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки проектов' });
  }
});

// Get project by ID
app.get('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const project = projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки проекта' });
  }
});

// Create new project
app.post('/api/projects', (req, res) => {
  try {
    const projects = readProjects();
    const newProject = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    
    if (writeProjects(projects)) {
      res.status(201).json(newProject);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения проекта' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания проекта' });
  }
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (writeProjects(projects)) {
      res.json(projects[projectIndex]);
    } else {
      res.status(500).json({ error: 'Ошибка обновления проекта' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления проекта' });
  }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projects = readProjects();
    const filteredProjects = projects.filter(p => p.id !== req.params.id);
    
    if (projects.length === filteredProjects.length) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    if (writeProjects(filteredProjects)) {
      res.json({ message: 'Проект успешно удален' });
    } else {
      res.status(500).json({ error: 'Ошибка удаления проекта' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления проекта' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Transportation Innovations Moscow API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Транспортные инновации Москвы - API сервер',
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      projectById: '/api/projects/:id'
    },
    version: '1.0.0'
  });
});

// Initialize sample data on startup
initializeSampleData();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 API доступен по адресу http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
