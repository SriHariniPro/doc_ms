import { useState } from 'react';

function Classify() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Group files by their type
  const groupedFiles = files.reduce((acc, file) => {
    const fileType = file.type.split('/')[1] || 'others';
    if (!acc[fileType]) {
      acc[fileType] = [];
    }
    acc[fileType].push(file);
    return acc;
  }, {});

  // File Icon Components
  const FileIcon = ({ fileType }) => {
    const iconColor = {
      pdf: 'text-red-500',
      doc: 'text-blue-500',
      docx: 'text-blue-500',
      zip: 'text-yellow-500',
      others: 'text-gray-500',
    }[fileType] || 'text-gray-500';

    return (
      <svg 
        className={`w-8 h-8 ${iconColor}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  };

  const FileTypeIcon = ({ type }) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      ppt: "📊",
      pptx: "📊",
      image: "🖼️",
      others: "📁"
    };
    return icons[type] || icons.others;
  };

  // Handlers
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload({ target: { files: droppedFiles } });
  };

  return (
    <div className="min-h-screen hero-pattern">
      {/* Upload Section */}
      <div 
        className="flex items-center justify-center pt-16 px-4"
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`text-center max-w-2xl w-full ${isDragging ? 'upload-zone' : 'card'}`}>
          <h1 className="page-title mb-8">
            Document Classification
          </h1>
          
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id="fileInput"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
            />
            <label
              htmlFor="fileInput"
              className="btn-primary cursor-pointer inline-flex items-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload Documents</span>
            </label>
            <p className="upload-text">
              or drag and drop files here
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="max-w-xl mx-auto mt-8 px-4">
          <div className="bg-indigo-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Files Display Section */}
      <div className="container mx-auto px-4 py-12">
        {Object.entries(groupedFiles).map(([fileType, filesOfType]) => (
          <div key={fileType} className="mb-12 fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize flex items-center">
              <span className="text-indigo-600 mr-2">
                <FileTypeIcon type={fileType} />
              </span>
              {fileType} Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filesOfType.map((file, index) => (
                <div key={index} className="file-card">
                  <div className="flex items-center space-x-4">
                    <div className="text-indigo-600 text-2xl">
                      <FileIcon fileType={fileType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Classify; 
