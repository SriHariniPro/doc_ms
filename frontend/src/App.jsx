import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Classify from './components/Classify/Classify';
import Extract from './components/Extract/Extract';
import Semantic from './components/Semantic/Semantic';

function App() {
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
        <Route path="/extract" element={<Extract />} />
        <Route path="/organize" element={<OrganizeComponent />} />
        <Route path="/manage" element={<ManageComponent />} />
      </Routes>
    </Router>
  );
}

export default App; 
