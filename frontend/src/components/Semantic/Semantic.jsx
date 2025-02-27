import React, { useState } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const Semantic = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLoading(true);

    try {
      const { default: pdfParse } = await import("pdf-parse");
      const { default: mammoth } = await import("mammoth");

      const reader = new FileReader();
      reader.onload = async (event) => {
        let text = "";
        if (file.type === "application/pdf") {
          text = (await pdfParse(event.target.result)).text;
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          text = (await mammoth.extractRawText({ arrayBuffer: event.target.result })).value;
        }
        setAnalysisResult([{ title: "Extracted Text", content: text || "No content found", icon: CheckCircle }]);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File Processing Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-4xl mb-12">Semantic Understanding</h1>
        <div className="card max-w-4xl mx-auto p-8">
          <div className="flex flex-col items-center space-y-6">
            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </label>
            {loading && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
          {analysisResult.length > 0 && (
            <div className="mt-8 space-y-4">
              {analysisResult.map((item, index) => (
                <Card key={index}>
                  <div className="flex items-start space-x-4 p-4">
                    <item.icon className="w-6 h-6 text-indigo-600 mt-1" />
                    <CardContent className="flex-1">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.content}</p>
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
