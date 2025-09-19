// FIX: Add a triple-slash directive to include the DOM library types. This resolves errors related to missing browser-specific type definitions.
/// <reference lib="dom" />

import { useState, useCallback } from 'react';
import { ImageResult } from '../types';

declare const JSZip: any;

const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9_.\-]/gi, '_').toLowerCase().substring(0, 50);
};

export const useImageDownloader = () => {
    const [isZipping, setIsZipping] = useState(false);

    const downloadImage = useCallback((dataUrl: string, prompt: string) => {
        // FIX: Prefix with `window` to resolve missing DOM typings.
        const link = window.document.createElement('a');
        link.href = dataUrl;
        link.download = `${sanitizeFilename(prompt)}.jpeg`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    }, []);

    const downloadAllAsZip = useCallback(async (results: ImageResult[]) => {
        if (typeof JSZip === 'undefined') {
            // FIX: Prefix with `window` to resolve missing DOM typings.
            window.alert('JSZip library is not loaded. Cannot create a zip file.');
            return;
        }
        setIsZipping(true);
        try {
            const zip = new JSZip();
            
            // Keep track of filenames to avoid duplicates
            const filenames = new Map<string, number>();

            for (const result of results) {
                if (result.status === 'success' && result.data) {
                    const base64Data = result.data.split(',')[1];
                    let baseFilename = sanitizeFilename(result.prompt);
                    
                    let count = filenames.get(baseFilename) || 0;
                    let finalFilename = `${baseFilename}${count > 0 ? `_${count}` : ''}.jpeg`;
                    
                    while (zip.file(finalFilename)) {
                        count++;
                        finalFilename = `${baseFilename}_${count}.jpeg`;
                    }
                    filenames.set(baseFilename, count + 1);

                    zip.file(finalFilename, base64Data, { base64: true });
                }
            }
            
            const content = await zip.generateAsync({ type: 'blob' });
            
            // FIX: Prefix with `window` to resolve missing DOM typings.
            const link = window.document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'image_batch_generator_results.zip';
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error("Error creating zip file:", error);
            // FIX: Prefix with `window` to resolve missing DOM typings.
            window.alert("Failed to create the zip file.");
        } finally {
            setIsZipping(false);
        }
    }, []);

    return { downloadImage, downloadAllAsZip, isZipping };
};