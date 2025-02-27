import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const Extract = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const extractMetadata = (text) => {
    const dateRegex = /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/g;
    const amountRegex = /\b\$?\d+(?:,\d{3})*(?:\.\d{2})?\b/g;
    const nameRegex = /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g;

    return {
      dates: text.match(dateRegex) || [],
      amounts: text.match(amountRegex) || [],
      names: text.match(nameRegex) || [],
    };
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageURL(URL.createObjectURL(file));
    }
  };

  const handleOCRProcessing = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(selectedFile, "eng");
      const extractedText = data.text;
      const metadata = extractMetadata(extractedText);

      setOcrResult([
        { title: "Extracted Text", content: extractedText, icon: FileText },
        { title: "Dates", content: metadata.dates.join(", ") || "None", icon: CheckCircle },
        { title: "Names", content: metadata.names.join(", ") || "None", icon: CheckCircle },
        { title: "Amounts", content: metadata.amounts.join(", ") || "None", icon: CheckCircle },
      ]);
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-4xl mb-12">Intelligent Content Extraction</h1>

        <div className="card max-w-4xl mx-auto p-8">
          {/* Upload Section */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full text-center">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload" 
              />
              <label 
                htmlFor="file-upload" 
                className="btn-primary cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </label>
            </div>

            {imageURL && (
              <div className="w-full max-w-md">
                <img 
                  src={imageURL} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* OCR Processing Button */}
            <Button 
              onClick={handleOCRProcessing} 
              disabled={!selectedFile || loading}
              className="mt-4"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                "Start OCR"
              )}
            </Button>
          </div>

          {/* OCR Results */}
          {ocrResult.length > 0 && (
            <div className="mt-8 space-y-4">
              {ocrResult.map((item, index) => (
                <Card key={index}>
                  <div className="flex items-start space-x-4 p-4">
                    <item.icon className="w-6 h-6 text-indigo-600 mt-1" />
                    <CardContent className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                        {item.content}
                      </p>
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

export default Extract; 
