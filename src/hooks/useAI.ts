import { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, AIConfig, DEFAULT_AI_CONFIG, VideoConfig, VideoGenerationResult } from '@/types';
import { sendToAI, generateVideo, generateVideoPrompt, pollVideoTask, getVideoContent } from '@/services/ai';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [videoPolling, setVideoPolling] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef<Settings | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setVideoPolling(false);
  }, []);

  const startPolling = useCallback((taskId: string, prompt: string) => {
    if (!settingsRef.current) return;

    setVideoPolling(true);
    let pollCount = 0;
    const maxPolls = 60; // Max 5 minutes (60 * 5s)

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    pollingRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        stopPolling();
        setError('Video generation timed out. Please try again.');
        setVideoResult(prev => prev ? { ...prev, status: 'failed', error: 'Timeout' } : null);
        return;
      }

      try {
        const response = await pollVideoTask(taskId, settingsRef.current!);
        console.log('[Polling] Result:', response);
        consecutiveErrors = 0; // Reset error counter on success

        if (response.result.status === 'completed') {
          stopPolling();
          setLoading(false);

          // If the URL is already a local Blob URL (from V4 stream logic), use it directly
          if (response.result.videoUrl?.startsWith('blob:')) {
            setVideoResult({ ...response.result, prompt: prompt });
            return;
          }

          // Fallback for external URLs: fetch-to-blob for authorized gateways
          if (response.result.videoUrl && settingsRef.current) {
            try {
              const { blobUrl, error: fetchErr } = await getVideoContent(response.result.videoUrl, settingsRef.current);
              if (fetchErr) {
                setError(fetchErr);
                setVideoResult({ ...response.result, status: 'failed', error: fetchErr, prompt: prompt });
              } else {
                setVideoResult({ ...response.result, videoUrl: blobUrl, prompt: prompt });
              }
            } catch (e) {
              setError('Failed to process video content');
              setVideoResult({ ...response.result, status: 'failed', error: 'Failed to process video content', prompt: prompt });
            }
          } else {
            setError('Video URL not found in API response');
            setVideoResult({ ...response.result, status: 'failed', error: 'Missing video URL', prompt: prompt });
          }
        } else if (response.result.status === 'failed') {
          stopPolling();
          const rawErr = (response.error || response.result.error || 'Video generation failed') as any;
          const errStr = typeof rawErr === 'object' && rawErr !== null ? (rawErr.message || JSON.stringify(rawErr)) : String(rawErr);
          setError(errStr);
          setVideoResult({
            ...response.result,
            prompt: prompt,
            type: 'text',
            status: 'failed',
            error: errStr
          });
          setLoading(false);
        } else {
          // Update progress
          setVideoResult(prev => prev ? {
            ...prev,
            status: response.result.status,
            progress: response.result.progress || (pollCount * 2),
          } : null);
        }
      } catch (err) {
        console.warn('[Polling] Network error during poll:', err);
        consecutiveErrors++;

        if (consecutiveErrors >= maxConsecutiveErrors) {
          stopPolling();
          setError('Network error: Connection lost during video generation. Please check your connection.');
          setVideoResult(prev => prev ? { ...prev, status: 'failed', error: 'Network Connection Lost' } : null);
          setLoading(false);
        }
        // Otherwise, keep the interval running - it will try again on the next tick
      }
    }, 5000); // Poll every 5 seconds
  }, [stopPolling]);

  const sendPrompt = useCallback(async (
    userContent: string,
    settings: Settings,
    aiConfig: AIConfig = DEFAULT_AI_CONFIG
  ) => {
    console.log('[useAI] sendPrompt called');
    console.log('[useAI] Settings:', { baseUrl: settings.baseUrl, model: settings.model, hasApiKey: !!settings.apiKey });
    console.log('[useAI] AI Config:', { outputLanguage: aiConfig.outputLanguage, outputFormat: aiConfig.outputFormat });

    setLoading(true);
    setError(null);
    setResult(null);
    setVideoResult(null);
    stopPolling();

    try {
      const response = await sendToAI(userContent, settings, aiConfig);

      if (response.error) {
        const errorMsg = response.error;
        console.error('[useAI] AI request failed:', errorMsg);
        setError(errorMsg);
        return null;
      }

      if (!response.content) {
        const errorMsg = 'AI returned empty content. Please try again.';
        console.error('[useAI] Empty content returned');
        setError(errorMsg);
        return null;
      }

      console.log('[useAI] AI request successful, content length:', response.content.length);
      setResult(response.content);
      return response.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[useAI] Exception in sendPrompt:', errorMessage);
      console.error('[useAI] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [stopPolling]);

  const sendVideoRequest = useCallback(async (
    productDescription: string,
    videoSystemPrompt: string,
    videoConfig: VideoConfig,
    settings: Settings
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setVideoResult(null);
    stopPolling();

    settingsRef.current = settings; // Store settings for polling

    try {
      // Step 1: Generate video prompt first
      const promptResponse = await generateVideoPrompt(productDescription, videoSystemPrompt, settings);

      if (promptResponse.error) {
        setError(promptResponse.error);
        setLoading(false);
        return null; // Return null on error
      }

      const videoPrompt = promptResponse.prompt;

      // Step 2: Generate video using the prompt
      const response = await generateVideo(videoPrompt, videoConfig, settings);

      if (response.error && !response.result.taskId) {
        // Error without task ID means complete failure
        setError(response.error);
        if (response.result.prompt) {
          setVideoResult({
            ...response.result,
            type: 'text',
            status: 'failed',
          });
        }
        setLoading(false);
        return response.result;
      }

      setVideoResult(response.result);

      // If pending, queued, processing or in_progress, start polling
      const isStillWorking = ['pending', 'processing', 'queued', 'in_progress', 'running', 'starting'].includes(response.result.status);
      if (isStillWorking && response.result.taskId) {
        console.log(`[useAI] Task initiated with status "${response.result.status}". Starting poll...`);
        startPolling(response.result.taskId, response.result.prompt || '');
        return response.result;
      }

      // If already completed or failed
      setLoading(false);
      return response.result;
    } catch (err) {
      setError(String(err));
      setLoading(false);
      return null;
    }
  }, [stopPolling, startPolling]);

  const clearResult = useCallback(() => {
    setResult(null);
    setVideoResult(null);
    setError(null);
    stopPolling();
  }, [stopPolling]);

  return {
    loading,
    error,
    result,
    videoResult,
    videoPolling,
    sendPrompt,
    sendVideoRequest,
    clearResult,
    stopPolling,
  };
}
