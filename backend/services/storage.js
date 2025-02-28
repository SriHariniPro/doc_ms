import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FileStorage {
  constructor() {
    this.storageDir = path.join(__dirname, '..', 'data');
    this.documentsDir = path.join(this.storageDir, 'documents');
    this.analysisDir = path.join(this.storageDir, 'analysis');
    this.init();
  }

  async init() {
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.mkdir(this.documentsDir, { recursive: true });
    await fs.mkdir(this.analysisDir, { recursive: true });
  }

  async saveDocument(document) {
    const { title, content, fileType, analysis } = document;
    const timestamp = Date.now();
    const id = `${timestamp}-${title.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Save document content
    await fs.writeFile(
      path.join(this.documentsDir, `${id}.json`),
      JSON.stringify({
        id,
        title,
        content,
        fileType,
        uploadDate: new Date(timestamp).toISOString()
      })
    );

    // Save analysis separately
    if (analysis) {
      await fs.writeFile(
        path.join(this.analysisDir, `${id}.json`),
        JSON.stringify(analysis)
      );
    }

    return { id };
  }

  async getDocument(id) {
    try {
      const documentPath = path.join(this.documentsDir, `${id}.json`);
      const analysisPath = path.join(this.analysisDir, `${id}.json`);

      const document = JSON.parse(await fs.readFile(documentPath, 'utf-8'));
      try {
        document.analysis = JSON.parse(await fs.readFile(analysisPath, 'utf-8'));
      } catch (e) {
        // Analysis might not exist
        document.analysis = null;
      }

      return document;
    } catch (error) {
      return null;
    }
  }

  async getAllDocuments() {
    const files = await fs.readdir(this.documentsDir);
    const documents = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const id = file.replace('.json', '');
          return await this.getDocument(id);
        })
    );
    return documents.filter(doc => doc !== null);
  }

  async deleteDocument(id) {
    try {
      await fs.unlink(path.join(this.documentsDir, `${id}.json`));
      try {
        await fs.unlink(path.join(this.analysisDir, `${id}.json`));
      } catch (e) {
        // Analysis file might not exist
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new FileStorage(); 
