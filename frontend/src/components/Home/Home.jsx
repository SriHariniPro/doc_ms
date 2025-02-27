import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Document Upload',
      description: 'Upload and manage your documents securely',
      icon: '📄',
      path: '/upload'
    },
    {
      title: 'Smart Classification',
      description: 'AI-powered document categorization',
      icon: '🤖',
      path: '/classify'
    },
    {
      title: 'Quick Search',
      description: 'Find documents instantly with smart search',
      icon: '🔍',
      path: '/search'
    },
    {
      title: 'Secure Storage',
      description: 'Enterprise-grade security for your files',
      icon: '🔒',
      path: '/storage'
    }
  ];

  return (
    <div className="hero-pattern">
      <div className="container mx-auto px-4 py-16">
        <h1 className="page-title text-center text-5xl mb-12">
          Document Management System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">
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
