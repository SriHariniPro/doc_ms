const Document = require('../models/document.model');

exports.saveDocument = async (req, res) => {
  try {
    const { title, content, fileType, analysis } = req.body;

    const document = new Document({
      title,
      content,
      fileType,
      analysis
    });

    const savedDocument = await document.save();
    res.status(201).json(savedDocument);
  } catch (error) {
    res.status(500).json({
      message: 'Error saving document',
      error: error.message
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, fileType } = req.query;
    const query = fileType ? { fileType } : {};
    
    const documents = await Document.find(query)
      .sort({ uploadDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Document.countDocuments(query);

    res.status(200).json({
      documents,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalDocuments: total
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving documents',
      error: error.message
    });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
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
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting document',
      error: error.message
    });
  }
}; 
