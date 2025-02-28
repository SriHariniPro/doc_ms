import React, { useState } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { processDocument } from "../../utils/documentProcessor";
import axios from "axios";

const Extract = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setLoading(true);

    try {
      // First process the document locally
      const text = await processDocument(file);
      
      // Create a form data object to send to the Flask backend
      const formData = new FormData();
      formData.append('file', file);

      // Send to Flask backend for analysis
      const analysisResponse = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const documentData = {
        title: file.name,
        content: text,
        fileType: file.type,
        analysis: analysisResponse.data
      };

      // Save to MongoDB through Node.js backend
      await axios.post('http://localhost:3000/api/documents', documentData);

      setExtractedContent({
        text,
        analysis: analysisResponse.data
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-4xl mb-12">
          Document Content Extraction
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
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing document...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-red-500">
                {error}
              </div>
            )}

            {/* Results */}
            {extractedContent && (
              <div className="w-full space-y-6">
                {/* Extracted Text */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Extracted Text
                    </h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                      {extractedContent.text}
                    </p>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {extractedContent.analysis && (
                  <>
                    {/* Sentiment */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
                        <div className="mt-2">
                          <p className="text-gray-600">
                            {extractedContent.analysis.sentiment.sentiment}
                          </p>
                          <div className="mt-2 text-sm">
                            <p>Positive: {extractedContent.analysis.sentiment.scores.pos}</p>
                            <p>Negative: {extractedContent.analysis.sentiment.scores.neg}</p>
                            <p>Neutral: {extractedContent.analysis.sentiment.scores.neu}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Entities */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold">Named Entities</h3>
                        <div className="mt-2">
                          {Object.entries(extractedContent.analysis.entities).map(([type, entities]) => (
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
                          {extractedContent.analysis.topics.map((topic, index) => (
                            <div key={index} className="mb-2">
                              <h4 className="font-medium">{topic.topic}</h4>
                              <p className="text-gray-600">{topic.words.join(', ')}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Extract; 
