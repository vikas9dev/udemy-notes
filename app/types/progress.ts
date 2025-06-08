export interface Progress {
  progress: number;
  status: 'processing' | 'completed' | 'error';
  message: string;
  chapter?: string;
  lecture?: string;
  error?: string;
} 