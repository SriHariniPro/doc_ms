const File = require('../models/file.model');
const path = require('path');
const fs = require('fs').promises;

exports.uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    const savedFiles = await Promise.all(
      files.map(async (file) => {
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
    res.status(500).json({
      message: 'Error uploading files',
      error: error.message
    });
  }
};

exports.getFilesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const files = await File.find({ fileType: type })
      .sort({ uploadDate: -1 });
    
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
    const files = await File.find()
      .sort({ uploadDate: -1 });
    
    res.status(200).json(files);
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
    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from filesystem
    await fs.unlink(file.path);
    
    // Delete file record from database
    await File.findByIdAndDelete(id);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting file',
      error: error.message
    });
  }
}; 