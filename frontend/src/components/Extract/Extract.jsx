import React, { useState } from "react";
import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { Upload, FileText, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const Extract = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("");

      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleOCRProcessing = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setErrorMessage("");
    
    try {
      const fileType = selectedFile.type;
      let extractedText = "";

      if (fileType.startsWith("image/")) {
        const { data } = await Tesseract.recognize(selectedFile, "eng");
        extractedText = data.text;
      } else if (fileType === "application/pdf") {
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        extractedText = await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const text = await pdfParse(reader.result);
              resolve(text.text);
            } catch (error) {
              reject("Error processing PDF.");
            }
          };
          reader.onerror = () => reject("Failed to read the file.");
        });
      } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        extractedText = await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const text = await mammoth.extractRawText({ arrayBuffer: reader.result });
              resolve(text.value);
            } catch (error) {
              reject("Error processing DOCX.");
            }
          };
          reader.onerror = () => reject("Failed to read the file.");
        });
      } else {
        setErrorMessage("Unsupported file type. Please upload an image, PDF, or DOCX file.");
        setLoading(false);
        return;
      }

      const metadata = extractMetadata(extractedText);

      setOcrResult([
        { title: "Extracted Text", content: extractedText, icon: FileText },
        { title: "Dates", content: metadata.dates.join(", ") || "None", icon: CheckCircle },
        { title: "Names", content: metadata.names.join(", ") || "None", icon: CheckCircle },
        { title: "Amounts", content: metadata.amounts.join(", ") || "None", icon: CheckCircle },
      ]);
    } catch (error) {
      setErrorMessage("An error occurred during processing.");
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
                accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleFileChange} 
                className="hidden" 
                id="file-upload" 
              />
              <label 
                htmlFor="file-upload" 
                className="btn-primary cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload File</span>
              </label>
            </div>

            {filePreview && (
              <div className="w-full max-w-md">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {errorMessage && (
              <div className="text-red-500 flex items-center space-x-2">
                <XCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
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
