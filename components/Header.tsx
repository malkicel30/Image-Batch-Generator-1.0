
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-gray border-b border-brand-border shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-brand-light tracking-wide">
          Gemini Image Batch Generator
        </h1>
      </div>
    </header>
  );
};
