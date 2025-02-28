import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { storage } from './services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-production-domain' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
};
createUploadsDir();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Document routes
app.post('/api/documents', async (req, res) => {
  try {
    const result = await storage.saveDocument(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Error saving document',
      error: error.message
    });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const documents = await storage.getAllDocuments();
    res.status(200).json({
      documents,
      total: documents.length
    });
  } catch (error) {
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
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
