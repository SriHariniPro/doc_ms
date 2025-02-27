const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fileController = require('../controllers/file.controller');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const fileType = file.mimetype.split('/')[1] || 'others';
    const dir = path.join(__dirname, '../uploads', fileType);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.array('files'), fileController.uploadFiles);
router.get('/files/:type', fileController.getFilesByType);
router.get('/files', fileController.getAllFiles);
router.delete('/files/:id', fileController.deleteFile);

module.exports = router; 