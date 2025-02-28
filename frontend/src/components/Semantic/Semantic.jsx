import React, { useState } from "react";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import natural from 'natural';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

const Semantic = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const extractText = async (file) => {
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ');
        }
        return text;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      }
      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from file');
    }
  };

  const analyzeSentiment = (text) => {
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);
    return result.score > 0 ? "Positive" : result.score < 0 ? "Negative" : "Neutral";
  };

  const extractEntities = (text) => {
    const doc = nlp(text);
    return {
      PERSON: doc.people().out('array'),
      ORGANIZATION: doc.organizations().out('array'),
      PLACE: doc.places().out('array'),
      DATE: doc.dates().out('array')
    };
  };

  const extractTopics = (text) => {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    
    // Tokenize and add document
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    tfidf.addDocument(tokens);

    // Get top terms
    const topics = [];
    tfidf.listTerms(0).slice(0, 10).forEach(item => {
      topics.push(item.term);
    });

    return topics;
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      // Extract text from file
      const text = await extractText(selectedFile);
      if (!text) {
        throw new Error('No text could be extracted from the file');
      }

      // Perform analysis
      const sentiment = analyzeSentiment(text);
      const entities = extractEntities(text);
      const topics = extractTopics(text);

      setAnalysisResult({
        sentiment,
        entities,
        topics
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-center text-4xl mb-12">Semantic Analysis</h1>
        <div className="card max-w-4xl mx-auto p-8">
          <div className="flex flex-col items-center space-y-6">
            <input 
              type="file" 
              accept=".pdf,.docx" 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload" 
            />
            <label 
              htmlFor="file-upload" 
              className="btn-primary cursor-pointer flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </label>
            {selectedFile && (
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name}
              </p>
            )}
            <Button 
              disabled={!selectedFile || loading} 
              onClick={analyzeFile} 
              className="mt-4"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </span>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {analysisResult && (
            <Card className="mt-8 p-4">
              <CardContent>
                <h3 className="text-lg font-semibold">Sentiment: {analysisResult.sentiment}</h3>
                <h3 className="mt-4 text-lg font-semibold">Topics:</h3>
                <p>{analysisResult.topics.join(", ")}</p>
                <h3 className="mt-4 text-lg font-semibold">Named Entities:</h3>
                <pre>{JSON.stringify(analysisResult.entities, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Semantic; 
