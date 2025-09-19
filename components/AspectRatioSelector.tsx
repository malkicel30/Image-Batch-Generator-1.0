// FIX: Add a triple-slash directive to include the DOM library types. This resolves errors related to missing browser-specific type definitions.
/// <reference lib="dom" />

import React from 'react';
import { AspectRatio } from '../types';

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Landscape)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Tall)' },
];

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
  disabled: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">
        Image Aspect Ratio
      </label>
      <select
        id="aspect-ratio"
        value={value}
        onChange={(e) => onChange(e.target.value as AspectRatio)}
        disabled={disabled}
        className="w-full bg-brand-dark border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-light focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        {ASPECT_RATIOS.map((ratio) => (
          <option key={ratio.value} value={ratio.value}>
            {ratio.label}
          </option>
        ))}
      </select>
    </div>
  );
};