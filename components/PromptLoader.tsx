/// <reference lib="dom" />

import React, { useRef, useCallback } from 'react';
import { PromptData } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';

interface PromptLoaderProps {
  onPromptsLoaded: (prompts: PromptData[]) => void;
  disabled: boolean;
}

export const PromptLoader: React.FC<PromptLoaderProps> = ({ onPromptsLoaded, disabled }) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      const textFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

      if (textFiles.length === 0) {
        onPromptsLoaded([]);
        return;
      }
      
      const fileReadPromises = textFiles.map(file => {
        return new Promise<PromptData>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve({ filename: file.name, content: content.trim() });
          };
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      });

      try {
        const loadedPrompts = await Promise.all(fileReadPromises);
        onPromptsLoaded(loadedPrompts.filter(p => p.content));
      } catch (error) {
        console.error("Error reading prompt files:", error);
        window.alert("An error occurred while reading the prompt files. Please check the console for details.");
      }
    }
    if(event.currentTarget) {
        event.currentTarget.value = '';
    }
  }, [onPromptsLoaded]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      try {
        const content = await file.text();
        const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
        const prompts: PromptData[] = lines.map((lineContent, index) => ({
          filename: `${file.name} (L${index + 1})`,
          content: lineContent,
        }));
        onPromptsLoaded(prompts);
      } catch (error) {
        console.error("Error reading prompt file:", error);
        window.alert("An error occurred while reading the prompt file.");
      }
    }
    if (event.currentTarget) {
      event.currentTarget.value = '';
    }
  }, [onPromptsLoaded]);

  return (
    <div className="bg-brand-gray border border-brand-border rounded-lg p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Step 1: Load Your Prompts</h2>
      <p className="text-gray-400 mb-6">Choose to load from a folder (one prompt per file) or a single file (one prompt per line).</p>
      
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        className="hidden"
        disabled={disabled}
        // @ts-ignore
        webkitdirectory=""
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt"
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => folderInputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <FolderIcon />
          <span>Select Folder (per file)</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          <FileIcon />
          <span>Select File (per line)</span>
        </button>
      </div>
    </div>
  );
};