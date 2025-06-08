import React, { useEffect, useState } from 'react';
import { Progress } from '../types/progress';

interface GenerateProgressProps {
  courseId: string;
  lectureIds: number[];
  onClose: () => void;
  isGenerating: boolean;
}

export default function GenerateProgress({ courseId, lectureIds, onClose, isGenerating }: GenerateProgressProps) {
  const [progress, setProgress] = useState<Progress>({
    progress: 0,
    status: 'processing',
    message: 'Starting note generation...'
  });
  const [zipStatus, setZipStatus] = useState<'idle' | 'generating' | 'downloaded'>('idle');

  useEffect(() => {
    if (isGenerating) {
      setProgress({
        progress: 0,
        status: 'processing',
        message: 'Starting note generation...'
      });
      setZipStatus('idle');
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;

    const cookie = localStorage.getItem('udemyCookie');
    if (!cookie) {
      setProgress({
        progress: 0,
        status: 'error',
        message: 'No Udemy cookie found. Please enter your cookie first.'
      });
      return;
    }

    let abortController = new AbortController();

    async function startEventStream() {
      try {
        const response = await fetch(
          `/api/generate-zip/progress?courseId=${courseId}&lectureIds=${lectureIds.map(id => id.toString()).join(',')}`,
          {
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'X-Udemy-Cookie': cookie || ''
            },
            signal: abortController.signal
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to connect to progress stream: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Process all complete lines
          buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('Progress update:', data);
                setProgress(data);

                if (data.status === 'completed') {
                  setZipStatus('generating');
                  setProgress(prev => ({
                    ...prev,
                    message: 'Generating ZIP file...'
                  }));
                  downloadZip();
                  return;
                }
              } catch (e) {
                console.error('Error parsing progress data:', e);
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Progress stream aborted');
          return;
        }
        console.error('Progress stream error:', error);
        setProgress({
          progress: 0,
          status: 'error',
          message: error instanceof Error ? error.message : 'Connection lost. Please try again.',
        });
      }
    }

    startEventStream();

    return () => {
      abortController.abort();
    };
  }, [courseId, lectureIds, isGenerating]);

  const downloadZip = async () => {
    try {
      const cookie = localStorage.getItem('udemyCookie');
      if (!cookie) {
        throw new Error('No Udemy cookie found');
      }

      const response = await fetch('/api/generate-zip/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Udemy-Cookie': cookie || ''
        },
        body: JSON.stringify({ 
          courseId, 
          lectureIds: lectureIds.map(id => id.toString())
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'udemy-notes.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setZipStatus('downloaded');
      setProgress(prev => ({
        ...prev,
        message: 'File downloaded.'
      }));
      // Do not auto-close, let user close manually
    } catch (error) {
      console.error('Error downloading ZIP:', error);
      setProgress({
        progress: 100,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to download the ZIP file. Please try again.',
      });
    }
  };

  if (!isGenerating) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {progress.status === 'completed' && zipStatus === 'downloaded'
            ? 'Success!'
            : progress.status === 'completed' && zipStatus === 'generating'
            ? 'Generating ZIP file...'
            : `Generating Notes... ${progress.progress}%`}
        </h3>
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className={`bg-indigo-600 h-3 rounded-full transition-all duration-300`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{progress.message}</p>
        {progress.chapter && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Chapter: {progress.chapter}
          </p>
        )}
        {progress.lecture && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Lecture: {progress.lecture}
          </p>
        )}
        {(progress.status === 'error' || zipStatus === 'downloaded') && (
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mt-4"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
} 