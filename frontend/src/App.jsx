import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Classify from './components/Classify/Classify';

function App() {
  const ExtractComponent = () => (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title mb-8">Intelligent Content Extraction</h1>
        <div className="card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">OCR Processing</h2>
              <p className="text-gray-600 mb-6">
                Extract text from images and scanned documents using advanced OCR technology.
              </p>
              <button className="btn-primary">Start OCR</button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Metadata Generation</h2>
              <p className="text-gray-600 mb-6">
                Automatically extract key information like dates, names, and amounts.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📅</span> Dates
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">👤</span> Names
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">💰</span> Amounts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SemanticComponent = () => (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title mb-8">Semantic Understanding</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Topic Analysis</h2>
            <p className="text-gray-600 mb-6">
              Identify main topics and themes within documents using NLP.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Finance', 'Legal', 'Technology', 'Healthcare'].map(topic => (
                <span key={topic} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Entity Recognition</h2>
            <p className="text-gray-600 mb-6">
              Extract and categorize named entities from documents.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">People</span>
                <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-indigo-500"></div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">Organizations</span>
                <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-indigo-500"></div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-20 text-sm text-gray-500">Locations</span>
                <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const OrganizeComponent = () => (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title mb-8">Niche Document Organization</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Legal Documents</h3>
            <p className="text-gray-600 text-sm">
              Specialized organization for contracts, agreements, and legal filings.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-3xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Medical Records</h3>
            <p className="text-gray-600 text-sm">
              HIPAA-compliant organization for patient records and medical documents.
            </p>
          </div>
          <div className="card p-6">
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Financial Reports</h3>
            <p className="text-gray-600 text-sm">
              Structured organization for financial statements and reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ManageComponent = () => (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title mb-8">Document Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Search</h3>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search documents..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-2 text-gray-500">
                🔍
              </button>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Version Control</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Version 1.0</span>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Version 2.0</span>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classify" element={<Classify />} />
        <Route path="/extract" element={<ExtractComponent />} />
        <Route path="/semantic" element={<SemanticComponent />} />
        <Route path="/organize" element={<OrganizeComponent />} />
        <Route path="/manage" element={<ManageComponent />} />
      </Routes>
    </Router>
  );
}

export default App; 
