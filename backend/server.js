import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';
import { storage } from './services/storage.js';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS Configuration
app.use(cors({
  origin: '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create required directories
const createDirectories = async () => {
  const dirs = [
    path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'),
    path.join(__dirname, 'data'),
    path.join(__dirname, 'data/documents'),
    path.join(__dirname, 'data/analysis')
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
};
createDirectories();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Document routes
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await storage.saveDocument({
      title: req.file.originalname,
      content: req.body.content || '',
      fileType: req.file.mimetype,
      filePath: req.file.path,
      analysis: req.body.analysis
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    res.status(500).json({
      message: 'Error saving document',
      error: error.message
    });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const documents = await storage.getAllDocuments();
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDocs = documents.slice(startIndex, endIndex);

    res.status(200).json({
      documents: paginatedDocs,
      currentPage: Number(page),
      totalPages: Math.ceil(documents.length / limit),
      totalDocuments: documents.length
    });
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    res.status(500).json({
      message: 'Error retrieving documents',
      error: error.message
    });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await storage.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(document);
  } catch (error) {
    console.error(`Error in GET /api/documents/${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error retrieving document',
      error: error.message
    });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const success = await storage.deleteDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error in DELETE /api/documents/${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error deleting document',
      error: error.message
    });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('GET    /');
  console.log('GET    /api/documents');
  console.log('POST   /api/documents');
  console.log('GET    /api/documents/:id');
  console.log('DELETE /api/documents/:id');
}); 
