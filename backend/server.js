require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fileRoutes = require('./routes/file.routes');
const path = require('path');
const fs = require('fs').promises;

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-production-domain' : 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR);
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
};
createUploadsDir();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', fileRoutes);

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR)));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
