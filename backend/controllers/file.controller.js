const File = require('../models/file.model');
const path = require('path');
const fs = require('fs').promises;
const isValidFileType = (mimetype) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  return allowedTypes.includes(mimetype);
};

exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        // Validate file type
        if (!isValidFileType(file.mimetype)) {
          await fs.unlink(file.path);
          throw new Error(`Invalid file type: ${file.mimetype}`);
        }

        const fileType = file.mimetype.split('/')[1] || 'others';
        const newFile = new File({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          fileType: fileType
        });
        return await newFile.save();
      })
    );

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: savedFiles
    });
  } catch (error) {
    // Clean up any uploaded files if there's an error
    if (req.files) {
      await Promise.all(
        req.files.map(file => fs.unlink(file.path).catch(() => {}))
      );
    }

    res.status(500).json({
      message: 'Error uploading files',
      error: error.message
    });
  }
};

exports.getFilesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!type) {
      return res.status(400).json({ message: 'File type is required' });
    }

    const files = await File.find({ fileType: type })
      .sort({ uploadDate: -1 });
    
    if (!files.length) {
      return res.status(404).json({ message: 'No files found for this type' });
    }

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving files',
      error: error.message
    });
  }
};

exports.getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const files = await File.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await File.countDocuments();

    res.status(200).json({
      files,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalFiles: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving files',
      error: error.message
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'File ID is required' });
    }

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    try {
      await fs.access(file.path);
      await fs.unlink(file.path);
    } catch (error) {
      console.warn(`File ${file.path} not found in filesystem`);
    }
    
    await File.findByIdAndDelete(id);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting file',
      error: error.message
    });
  }
}; 
