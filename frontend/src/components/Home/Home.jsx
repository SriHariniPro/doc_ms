import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FileSearch, Brain, FolderKanban, Settings } from 'lucide-react';
import './Home.styles.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Document Classification",
      description: "Automatically categorize documents using AI",
      icon: FileSearch,
      path: "/classify"
    },
    {
      title: "Content Extraction",
      description: "Extract text and metadata from documents",
      icon: FileText,
      path: "/extract"
    },
    {
      title: "Semantic Analysis",
      description: "Understand document meaning and relationships",
      icon: Brain,
      path: "/semantic"
    },
    {
      title: "Document Organization",
      description: "Organize documents by industry and type",
      icon: FolderKanban,
      path: "/organize"
    },
    {
      title: "Document Management",
      description: "Smart search and version control",
      icon: Settings,
      path: "/manage"
    }
  ];

  return (
    <div className="min-h-screen hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">
          AI Document Management System
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => navigate(feature.path)}
            >
              <feature.icon className="w-12 h-12 text-indigo-600" />
              <h2 className="text-xl font-semibold mt-4">{feature.title}</h2>
              <p className="text-gray-600 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 
