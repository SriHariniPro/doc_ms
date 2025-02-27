const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
app.use(cors());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const fileType = file.mimetype.split('/')[1] || 'others';
    const dir = path.join(__dirname, 'uploads', fileType);
    
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

// File upload endpoint
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const fileDetails = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    }));

    // Here you could save file details to a database
    
    res.json({
      message: 'Files uploaded successfully',
      files: fileDetails
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// Get files by type endpoint
app.get('/api/files/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const dir = path.join(__dirname, 'uploads', type);
    
    const files = await fs.readdir(dir);
    const fileDetails = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(dir, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
    );

    res.json(fileDetails);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving files',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 