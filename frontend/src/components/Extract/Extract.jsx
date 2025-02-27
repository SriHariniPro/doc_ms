import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    const { data } = await Tesseract.recognize(selectedFile, "eng");
    const extractedText = data.text;
    const metadata = extractMetadata(extractedText);

    setOcrResult([
      { title: "Extracted Text", content: extractedText, icon: FileText },
      { title: "Dates", content: metadata.dates.join(", ") || "None", icon: CheckCircle },
      { title: "Names", content: metadata.names.join(", ") || "None", icon: CheckCircle },
      { title: "Amounts", content: metadata.amounts.join(", ") || "None", icon: CheckCircle },
    ]);

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Intelligent Content Extraction</h1>

      {/* Upload Section */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button className="flex gap-2">
            <Upload className="w-5 h-5" /> Upload Image
          </Button>
        </label>
        {imageURL && <img src={imageURL} alt="Uploaded Preview" className="w-64 h-64 object-cover rounded-lg shadow-md" />}
      </div>

      {/* OCR Processing Button */}
      <div className="text-center">
        <Button onClick={handleOCRProcessing} disabled={!selectedFile || loading} className="btn-primary">
          {loading ? <Loader2 className="animate-spin" /> : "Start OCR"}
        </Button>
      </div>

      {/* OCR Results */}
      {ocrResult.length > 0 && (
        <div className="mt-6">
          {ocrResult.map((item, index) => (
            <Card key={index} className="p-4 mb-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-6 h-6 text-gray-500" />
                <CardContent>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Extract;
