import React, { useState, useEffect } from 'react';
import { Upload, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import axios from 'axios';

// API endpoints
const NODE_API = import.meta.env.VITE_NODE_API_URL || 'http://localhost:3000';
const FLASK_API = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

const Semantic = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ node: false, flask: false });

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const [nodeHealth, flaskHealth] = await Promise.all([
          axios.get(`${NODE_API}/`),
          axios.get(`${FLASK_API}/`)
        ]);
        setBackendStatus({
          node: nodeHealth.data.status === 'ok',
          flask: flaskHealth.data.status === 'healthy'
        });
      } catch (error) {
        console.error('Backend health check failed:', error);
        setError('One or more backend services are not available. Please try again later.');
      }
    };
    checkBackendHealth();
  }, []);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      // Create FormData for both requests
      const formData = new FormData();
      formData.append('file', selectedFile);

      // First, upload to Node.js backend for storage
      console.log('Uploading to Node.js backend...');
      const uploadResponse = await axios.post(`${NODE_API}/api/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful:', uploadResponse.data);

      // Then send to Flask backend for analysis
      console.log('Sending to Flask backend for analysis...');
      const analysisResponse = await axios.post(`${FLASK_API}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Analysis successful:', analysisResponse.data);

      setAnalysis({
        ...analysisResponse.data,
        documentId: uploadResponse.data.id
      });
    } catch (error) {
      console.error('Error processing file:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the backend services are running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show backend status error if either service is down
  if (!backendStatus.node || !backendStatus.flask) {
    return (
      <div className="min-h-screen hero-pattern">
        <div className="container mx-auto px-4 py-16">
          <div className="card max-w-4xl mx-auto p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Service Unavailable</h2>
            <p className="text-gray-700">
              {!backendStatus.node && !backendStatus.flask 
                ? 'Both backend services are currently unavailable.' 
                : !backendStatus.node 
                  ? 'Document storage service is currently unavailable.' 
                  : 'Analysis service is currently unavailable.'}
            </p>
            <p className="text-gray-600 mt-2">Please try again later or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">
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
