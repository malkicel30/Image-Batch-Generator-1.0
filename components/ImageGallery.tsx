
import React from 'react';
import { ImageCard } from './ImageCard';
import { ImageResult } from '../types';

interface ImageGalleryProps {
  imageResults: ImageResult[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ imageResults }) => {
  return (
    <div className="bg-brand-gray border border-brand-border rounded-lg p-6">
       <h2 className="text-xl font-semibold mb-6">Results</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {imageResults.map((result, index) => (
          <ImageCard key={`${index}-${result.prompt}`} result={result} />
        ))}
      </div>
    </div>
  );
};
