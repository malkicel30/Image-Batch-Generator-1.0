
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptLoader } from './components/PromptLoader';
import { GenerationControls } from './components/GenerationControls';
import { ImageGallery } from './components/ImageGallery';
import { generateImage } from './services/geminiService';
import { AppStatus, ImageResult, PromptData, AspectRatio } from './types';

// Enhanced timer constants
const REQUEST_DELAY = 15000; // 15 seconds between requests to avoid rate-limiting
const PROGRESS_UPDATE_INTERVAL = 100; // Update progress every 100ms for smooth animation

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.Idle);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  
  // Enhanced progress tracking states
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [requestProgress, setRequestProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  // Refs for cleanup
  // FIX: Use `ReturnType<typeof setInterval>` for browser compatibility instead of `NodeJS.Timeout`.
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isGeneratingRef = useRef<boolean>(false);

  const handlePromptsLoaded = useCallback((loadedPrompts: PromptData[]) => {
    const validPrompts = loadedPrompts.filter(p => p.content.trim() !== '');
    setPrompts(validPrompts);
    setImageResults(validPrompts.map(prompt => ({
      prompt: prompt.filename,
      content: prompt.content,
      status: 'pending',
      data: null,
      error: null,
    })));
    setStatus(validPrompts.length > 0 ? AppStatus.Ready : AppStatus.Idle);
    
    // Reset all progress states
    setCurrentRequestIndex(0);
    setRequestProgress(0);
    setTimeRemaining(0);
    setTotalElapsedTime(0);
    setEstimatedTimeRemaining(0);
  }, []);

  // Enhanced progress tracking with real-time updates
  const startProgressTracking = useCallback((totalRequests: number) => {
    startTimeRef.current = Date.now();
    isGeneratingRef.current = true;
    
    progressIntervalRef.current = setInterval(() => {
      if (!isGeneratingRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      setTotalElapsedTime(Math.floor(elapsed / 1000));

      // Calculate estimated time remaining
      const completedRequests = currentRequestIndex;
      const avgTimePerRequest = completedRequests > 0 ? elapsed / completedRequests : REQUEST_DELAY * (completedRequests + 1);
      const remainingRequests = totalRequests - completedRequests;
      const estimatedRemaining = Math.floor((remainingRequests * avgTimePerRequest) / 1000);
      setEstimatedTimeRemaining(estimatedRemaining);

    }, PROGRESS_UPDATE_INTERVAL);
  }, [currentRequestIndex]);

  // Stop progress tracking
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    isGeneratingRef.current = false;
  }, []);

  // Enhanced delay function with countdown
  const delayWithCountdown = useCallback(async (delayMs: number) => {
    return new Promise<void>((resolve) => {
      let remaining = delayMs;
      setTimeRemaining(Math.ceil(remaining / 1000));

      const countdownInterval = setInterval(() => {
        remaining -= 100;
        setTimeRemaining(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setTimeRemaining(0);
          resolve();
        }
      }, 100);
    });
  }, []);

  // Enhanced request progress tracking
  const trackRequestProgress = useCallback(() => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2; // Increment for smooth animation
      setRequestProgress(Math.min(progress, 95)); // Cap at 95% until actual completion

      if (progress >= 95) {
        clearInterval(progressInterval);
      }
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  const handleStartGeneration = async () => {
    if (prompts.length === 0) return;

    setStatus(AppStatus.Generating);
    setCurrentRequestIndex(0);
    setRequestProgress(0);

    startProgressTracking(prompts.length);

    try {
      for (let i = 0; i < prompts.length; i++) {
        setCurrentRequestIndex(i);
        setRequestProgress(0);

        setImageResults(prev => prev.map((res, index) => 
          index === i ? { ...res, status: 'generating' } : res
        ));

        const stopRequestTracking = trackRequestProgress();

        try {
          const imageData = await generateImage(prompts[i].content, aspectRatio);
          
          setRequestProgress(100);
          stopRequestTracking();
          
          setImageResults(prev => prev.map((res, index) => 
            index === i ? { 
              ...res, 
              status: 'success', 
              data: `data:image/jpeg;base64,${imageData}` 
            } : res
          ));

        } catch (error) {
          stopRequestTracking();
          console.error(`Failed to generate image for prompt: "${prompts[i].filename}"`, error);
          
          setImageResults(prev => prev.map((res, index) =>
            index === i ? { 
              ...res, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'An unknown error occurred' 
            } : res
          ));
        }

        if (i < prompts.length - 1) {
          await delayWithCountdown(REQUEST_DELAY);
        }
      }
    } catch (error) {
      console.error('Generation process failed:', error);
    } finally {
      stopProgressTracking();
      setCurrentRequestIndex(prompts.length);
      setRequestProgress(0);
      setTimeRemaining(0);
      setStatus(AppStatus.Done);
    }
  };

  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const overallProgress = prompts.length > 0 
    ? ((currentRequestIndex + (requestProgress / 100)) / prompts.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-brand-light">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <PromptLoader 
            onPromptsLoaded={handlePromptsLoaded} 
            disabled={status === AppStatus.Generating} 
          />
          
          <GenerationControls
            status={status}
            promptCount={prompts.length}
            onGenerate={handleStartGeneration}
            imageResults={imageResults}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
          />

          {status === AppStatus.Generating && (
            <div className="bg-brand-gray rounded-lg p-6 border border-brand-border">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-300">
                    <span>Overall Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-brand-primary h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${overallProgress}%` }}
                      role="progressbar"
                      aria-valuenow={overallProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-300">
                    <span>Processing Prompt {currentRequestIndex < prompts.length ? currentRequestIndex + 1 : prompts.length}/{prompts.length}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${requestProgress}%` }}
                      role="progressbar"
                      aria-valuenow={requestProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center border-t border-brand-border pt-4 mt-4">
                  <div>
                    <div className="text-gray-400">Elapsed Time</div>
                    <div className="font-mono text-lg font-semibold text-brand-light">{formatTime(totalElapsedTime)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Est. Remaining</div>
                    <div className="font-mono text-lg font-semibold text-brand-light">{status === AppStatus.Generating ? formatTime(estimatedTimeRemaining) : '--:--'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Next Request In</div>
                    <div className="font-mono text-lg font-semibold text-yellow-400">
                      {timeRemaining > 0 ? formatTime(timeRemaining) : '--:--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Completed</div>
                    <div className="font-mono text-lg font-semibold text-brand-light">{currentRequestIndex}/{prompts.length}</div>
                  </div>
                </div>

                {currentRequestIndex < prompts.length && (
                  <div className="mt-4 p-3 bg-brand-dark rounded">
                    <div className="text-xs text-gray-400 mb-1">Current Prompt File:</div>
                    <p className="text-sm text-gray-200 truncate" title={prompts[currentRequestIndex].content}>{prompts[currentRequestIndex].filename}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {imageResults.length > 0 && <ImageGallery imageResults={imageResults} />}
        </div>
      </main>
    </div>
  );
};

export default App;
