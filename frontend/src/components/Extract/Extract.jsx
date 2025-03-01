import React, { useState, useEffect } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import axios from "axios";

// API endpoints
const NODE_API = 'http://localhost:3000';
const FLASK_API = 'http://localhost:5000';

const Extract = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedContent, setExtractedContent] = useState(null);
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
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
    setLoading(true);

    try {
      // Create FormData for both requests
      const formData = new FormData();
      formData.append('file', file);

      // Send to Flask backend for analysis
      console.log('Sending to Flask backend for analysis...');
      const analysisResponse = await axios.post(`${FLASK_API}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Analysis successful:', analysisResponse.data);

      // Save to Node.js backend
      console.log('Uploading to Node.js backend...');
      const documentFormData = new FormData();
      documentFormData.append('file', file);
      documentFormData.append('analysis', JSON.stringify(analysisResponse.data));
      
      const uploadResponse = await axios.post(`${NODE_API}/api/documents`, documentFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload successful:', uploadResponse.data);

      setExtractedContent({
        text: analysisResponse.data.text,
        analysis: analysisResponse.data
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
              <div className="text-red-500 p-4 bg-red-50 rounded-lg">
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
