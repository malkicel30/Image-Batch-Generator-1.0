
export enum AppStatus {
  Idle = 'idle',
  Ready = 'ready',
  Generating = 'generating',
  Done = 'done',
}

export type ImageResultStatus = 'pending' | 'generating' | 'success' | 'error';

export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export interface PromptData {
  filename: string;
  content: string;
}

export interface ImageResult {
  prompt: string; // filename
  content: string; // full prompt content
  status: ImageResultStatus;
  data: string | null;
  error: string | null;
}
