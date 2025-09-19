
import React from 'react';
import { AppStatus, ImageResult, AspectRatio } from '../types';
import { useImageDownloader } from '../hooks/useImageDownloader';
import { PlayIcon } from './icons/PlayIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Spinner } from './Spinner';
import { AspectRatioSelector } from './AspectRatioSelector';

interface GenerationControlsProps {
  status: AppStatus;
  promptCount: number;
  onGenerate: () => void;
  imageResults: ImageResult[];
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  status,
  promptCount,
  onGenerate,
  imageResults,
  aspectRatio,
  onAspectRatioChange,
}) => {
  const { downloadAllAsZip, isZipping } = useImageDownloader();
  const successfulResults = imageResults.filter(r => r.status === 'success');
  const canGenerate = (status === AppStatus.Ready || status === AppStatus.Done) && promptCount > 0;
  const canDownload = successfulResults.length > 0 && (status === AppStatus.Done || status === AppStatus.Ready || status === AppStatus.Idle);

  const getGenerateButtonText = () => {
    if (status === AppStatus.Generating) return 'Generating...';
    if (status === AppStatus.Done) return 'Generate Again';
    return 'Start Generation';
  };
  
  return (
    <div className="bg-brand-gray border border-brand-border rounded-lg p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
        {/* Settings Column */}
        <div>
          <h2 className="text-xl font-semibold mb-1">Step 2: Configure Settings</h2>
          <p className="text-gray-400 mb-4">
            Choose the desired aspect ratio for all images.
          </p>
          <AspectRatioSelector
            value={aspectRatio}
            onChange={onAspectRatioChange}
            disabled={status === AppStatus.Generating}
          />
        </div>
        
        {/* Actions Column */}
        <div className="flex flex-col justify-between h-full border-t border-brand-border md:border-t-0 md:border-l md:pl-8 pt-6 md:pt-0">
          <div>
            <h2 className="text-xl font-semibold mb-1">Step 3: Generate & Download</h2>
            <p className="text-gray-400 mb-4">
              {promptCount > 0 ? `Loaded ${promptCount} prompts. Ready.` : 'Load a prompt folder to begin.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={onGenerate}
              // FIX: Simplified disabled logic. The `!canGenerate` check correctly handles the `Generating` status.
              disabled={!canGenerate}
              className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed min-w-[180px]"
              aria-live="polite"
            >
              {status === AppStatus.Generating ? <Spinner /> : <PlayIcon />}
              <span>{getGenerateButtonText()}</span>
            </button>
            <button
              onClick={() => downloadAllAsZip(successfulResults)}
              disabled={!canDownload || isZipping}
              className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed min-w-[200px]"
              aria-live="polite"
            >
              {isZipping ? <Spinner /> : <DownloadIcon />}
              <span>{isZipping ? 'Zipping...' : `Download All (${successfulResults.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
