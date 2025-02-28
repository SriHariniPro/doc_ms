import React, { useState } from "react";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  const analyzeFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Error analyzing file:", error);
      setError(error.response?.data?.error || "Error processing file");
    } finally {
      setLoading(false);
    }
  };

  const formatEntities = (entities) => {
    return Object.entries(entities)
      .map(([type, values]) => `${type}: ${values.join(", ")}`)
      .join("\n");
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
