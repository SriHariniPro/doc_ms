const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');

// Document routes
router.post('/', documentController.saveDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.delete('/:id', documentController.deleteDocument);

module.exports = router; 
