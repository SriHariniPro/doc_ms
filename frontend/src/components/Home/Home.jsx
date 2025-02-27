import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Automated Classification & Tagging',
      description: 'AI-powered categorization of documents (invoices, contracts, resumes) with smart tagging using text analysis',
      icon: '🤖',
      path: '/classify'
    },
    {
      title: 'Intelligent Content Extraction',
      description: 'OCR-based extraction of key details (dates, amounts, names) to enhance search and organization',
      icon: '📄',
      path: '/extract'
    },
    {
      title: 'Semantic Understanding',
      description: 'Deep content analysis to identify topics, entities, sentiment, and relationships between documents',
      icon: '🧠',
      path: '/semantic'
    },
    {
      title: 'Niche Document Organization',
      description: 'Custom document management solutions tailored for specific industries like legal, medical, or finance',
      icon: '📁',
      path: '/organize'
    },
    {
      title: 'Innovative Document Management',
      description: 'Next-gen document handling with smart search, version control, collaborative editing, and AI-driven recommendations',
      icon: '✨',
      path: '/manage'
    }
  ];

  return (
    <div className="hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-5xl mb-12">
          Document Management System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate(feature.path)}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 
