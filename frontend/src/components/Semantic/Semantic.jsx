import React, { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import Sentiment from "sentiment";

const Semantic = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [textContent, setTextContent] = useState("");
  
  const extractTextFromFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      if (file.type === "application/pdf") {
        reader.onload = async (event) => {
          const data = await pdfParse(event.target.result);
          resolve(data.text);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        reader.onload = async (event) => {
          const data = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          resolve(data.value);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith("text")) {
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsText(file);
      } else {
        reject("Unsupported file format");
      }
    });
  };

  const analyzeText = (text) => {
    const sentiment = new Sentiment();
    const sentimentResult = sentiment.analyze(text);
    const words = text.split(/\s+/);
    const topics = Array.from(new Set(words.filter((word) => word.length > 5))).slice(0, 10);
    const entities = words.filter((word) => /^[A-Z][a-z]+$/.test(word));
    
    return {
      topics,
      entities,
      sentiment: sentimentResult.score > 0 ? "Positive" : sentimentResult.score < 0 ? "Negative" : "Neutral"
    };
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      setTextContent(text);
      const analysis = analyzeText(text);
      setAnalysisResult([
        { title: "Topics", content: analysis.topics.join(", ") || "None", icon: CheckCircle },
        { title: "Entities", content: analysis.entities.join(", ") || "None", icon: CheckCircle },
        { title: "Sentiment", content: analysis.sentiment, icon: CheckCircle }
      ]);
    } catch (error) {
      console.error("File Processing Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-4xl mb-12">Semantic Understanding & Relationship Discovery</h1>
        <div className="card max-w-4xl mx-auto p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full text-center">
              <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </label>
            </div>
            <Button disabled={!selectedFile || loading} className="mt-4">
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
          {analysisResult.length > 0 && (
            <div className="mt-8 space-y-4">
              {analysisResult.map((item, index) => (
                <Card key={index}>
                  <div className="flex items-start space-x-4 p-4">
                    <item.icon className="w-6 h-6 text-indigo-600 mt-1" />
                    <CardContent className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{item.content}</p>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Semantic;
