
import React from 'react';
import { ImageResult } from '../types';
import { Spinner } from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';
import { useImageDownloader } from '../hooks/useImageDownloader';

interface ImageCardProps {
  result: ImageResult;
}

export const ImageCard: React.FC<ImageCardProps> = ({ result }) => {
  const { downloadImage } = useImageDownloader();

  const handleDownload = () => {
    if (result.data) {
      downloadImage(result.data, result.prompt);
    }
  };

  const renderContent = () => {
    switch (result.status) {
      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-brand-gray">
            <p className="text-sm text-gray-400">Waiting...</p>
          </div>
        );
      case 'success':
        return (
          <img 
            src={result.data!} 
            alt={result.prompt} 
            className="w-full h-full object-cover" 
          />
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-red-900/20 p-4 text-center">
            <p className="text-red-400 font-semibold text-sm">Generation Failed</p>
            <p className="text-xs text-red-500 mt-2 line-clamp-3" title={result.error || 'Unknown error'}>
                {result.error || 'Unknown error'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative aspect-square w-full bg-brand-gray border border-brand-border rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-brand-primary/30 hover:shadow-2xl">
      <div className="relative flex-grow">
        <div className="absolute inset-0">
          {result.status === 'generating' ? (
             <div className="flex flex-col items-center justify-center h-full bg-brand-gray">
              <Spinner />
            </div>
          ) : renderContent()}
        </div>
      </div>
      <div className="p-3 bg-black/50 backdrop-blur-sm">
        <p className="text-xs text-gray-200 truncate" title={result.content}>{result.prompt}</p>
      </div>
      {result.status === 'success' && (
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-primary"
          title="Download Image"
        >
          <DownloadIcon />
        </button>
      )}
    </div>
  );
};
