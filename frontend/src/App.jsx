import { useState } from 'react';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Group files by their type
  const groupedFiles = files.reduce((acc, file) => {
    const fileType = file.type.split('/')[1] || 'others';
    if (!acc[fileType]) {
      acc[fileType] = [];
    }
    acc[fileType].push(file);
    return acc;
  }, {});

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);

    // Create FormData for upload
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Upload Section */}
      <div className="flex items-center justify-center pt-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Document Management System
          </h1>
          
          <div className="relative">
            <input
              type="file"
              className="hidden"
              id="fileInput"
              onChange={handleFileUpload}
              multiple
            />
            <label
              htmlFor="fileInput"
              className="btn-primary cursor-pointer inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Upload Documents</span>
            </label>
          </div>
        </div>
      </div>

      {/* Files Display Section */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedFiles).map(([fileType, filesOfType]) => (
          <div key={fileType} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 capitalize">
              {fileType} Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filesOfType.map((file, index) => (
                <div 
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon fileType={fileType} />
                    <div>
                      <p className="font-medium text-gray-800 truncate">
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

// File Icon Component
function FileIcon({ fileType }) {
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
}

export default App; 