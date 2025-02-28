import React, { useState } from 'react';
import { Upload, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import axios from 'axios';

const Semantic = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // First, upload to Node.js backend for storage
      const uploadResponse = await axios.post('http://localhost:3000/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Then send to Flask backend for analysis
      const analysisResponse = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysis({
        ...analysisResponse.data,
        documentId: uploadResponse.data.id
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.response?.data?.message || error.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">
          Semantic Analysis
        </h1>

        <div className="card max-w-4xl mx-auto p-8">
          {/* Upload Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full text-center">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </label>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 animate-pulse" />
                <span>Analyzing document...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500">
                {error}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="w-full space-y-6">
                {/* Sentiment Analysis */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
                    <div className="mt-2">
                      <p className="text-gray-600">
                        {analysis.sentiment.sentiment}
                      </p>
                      <div className="mt-2 text-sm">
                        <p>Positive: {analysis.sentiment.scores.pos}</p>
                        <p>Negative: {analysis.sentiment.scores.neg}</p>
                        <p>Neutral: {analysis.sentiment.scores.neu}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Named Entities */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">Named Entities</h3>
                    <div className="mt-2">
                      {Object.entries(analysis.entities).map(([type, entities]) => (
                        <div key={type} className="mb-2">
                          <h4 className="font-medium">{type}</h4>
                          <p className="text-gray-600">{entities.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Topics */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold">Topics</h3>
                    <div className="mt-2">
                      {analysis.topics.map((topic, index) => (
                        <div key={index} className="mb-2">
                          <h4 className="font-medium">{topic.topic}</h4>
                          <p className="text-gray-600">{topic.words.join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Semantic; 
