import { Settings, AIConfig, VideoConfig, VideoGenerationResult } from '@/types';

interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | MessageContent[];
}

interface MessageContent {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
}

interface AIResponse {
    content: string;
    error?: string;
}

interface VideoResponse {
    result: VideoGenerationResult;
    error?: string;
}

// LiteLLM Gateway Integration
// All requests now go through the unified LiteLLM gateway
// The gateway handles routing to different providers based on model names

/**
 * Log user activity for business analysis (Audit Trail)
 */
async function logUserActivity(data: {
    brandName: string;
    companyName: string;
    pageUrl: string;
    provider: string;
    model: string;
}) {
    console.log('[Audit Trail] Logging activity:', data);
    // Disabled failing internal audit fetch for now to prevent console noise
    return;
}

/**
 * Send text generation request to LiteLLM gateway
 * Simplified version - all vendor-specific logic removed
 */
export async function sendToAI(
    userContent: string,
    settings: Settings,
    aiConfig: AIConfig
): Promise<AIResponse> {
    console.log('[AI Service] ========== AI REQUEST STARTED ==========');
    console.log('[AI Service] LiteLLM Gateway Mode');
    console.log('[AI Service] API Mode:', settings.apiMode);
    console.log('[AI Service] Base URL:', settings.baseUrl);
    console.log('[AI Service] Model:', settings.model);

    // Determine API Key based on mode
    let apiKey = settings.apiKey;
    let baseUrl = settings.baseUrl;

    // Enterprise Mode (Internal): Read from environment variables
    if (settings.apiMode === 'internal') {
        console.log('[AI Service] Enterprise Mode - Reading from environment variables');
        apiKey = import.meta.env.VITE_LITELLM_API_KEY || '';
        baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'https://litellm.xooer.com/v1';
        console.log('[AI Service] Env API Key Length:', apiKey ? apiKey.length : 0);
        console.log('[AI Service] Env Base URL:', baseUrl);
    } else {
        console.log('[AI Service] Custom DIY Mode - Using user-provided settings');
        console.log('[AI Service] User API Key Length:', apiKey ? apiKey.length : 0);
    }

    // Validate API Key
    if (!apiKey) {
        const errorMsg = settings.apiMode === 'internal'
            ? 'Enterprise API Key not configured. Please add VITE_LITELLM_API_KEY to .env file.'
            : 'API Key not configured. Please add your LiteLLM Virtual Key in Settings.';
        console.error('[AI Service] Error:', errorMsg);
        return { content: '', error: errorMsg };
    }

    // MOCK MODE FOR TESTING
    if (apiKey === 'mock') {
        console.log('[AI Service] MOCK MODE ACTIVE');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            content: `[MOCK RESPONSE for ${settings.model}]\\n\\n**Meta Title**: ${settings.brandName || 'Product'} SEO Title\\n**Meta Description**: This is a mock SEO description for ${settings.companyName || 'the company'}.\\n\\nHere is your SEO blog content...`
        };
    }

    // Validate Base URL
    if (!baseUrl) {
        const errorMsg = 'Base URL not configured. Please check your settings.';
        console.error('[AI Service] Error:', errorMsg);
        return { content: '', error: errorMsg };
    }

    // Audit Trail Logging
    logUserActivity({
        brandName: settings.brandName || 'Unknown',
        companyName: settings.companyName || 'Unknown',
        pageUrl: window.location.href,
        provider: settings.provider,
        model: settings.model,
    });

    // Build standard OpenAI-compatible request
    const messages: AIMessage[] = [];

    if (aiConfig.systemPrompt && aiConfig.systemPrompt.trim()) {
        messages.push({ role: 'system', content: aiConfig.systemPrompt });
    }

    messages.push({ role: 'user', content: userContent });

    // Temperature mapping based on reasoning effort
    const reasoningMap: Record<string, number> = {
        'low': 0.3,
        'medium': 0.7,
        'high': 1.0,
    };

    const requestBody = {
        model: settings.model,  // Use model name as-is, LiteLLM handles mapping
        messages,
        temperature: reasoningMap[aiConfig.reasoningEffort] || 0.7,
        stream: false
    };

    // Unified endpoint - all requests go to /chat/completions
    const apiUrl = `${baseUrl}/chat/completions`;

    console.log('[AI Service] Endpoint:', apiUrl);
    console.log('[AI Service] Model:', requestBody.model);
    console.log('[AI Service] Temperature:', requestBody.temperature);

    try {
        // Standard OpenAI headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        console.log('[AI Service] Response status:', response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            let userFriendlyMessage = '';

            try {
                const errorText = await response.text();
                console.error('[AI Service] Error response body:', errorText.substring(0, 500));
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error?.message || errorData.message || errorMessage;

                    // Handle specific error cases with user-friendly messages
                    if (response.status === 403) {
                        userFriendlyMessage = 'API Key 已失效或权限不足，请检查 API Key 是否有效。';
                    } else if (response.status === 404) {
                        userFriendlyMessage = `模型不存在：${requestBody.model}。请检查模型名称是否正确。`;
                    } else if (response.status === 401) {
                        userFriendlyMessage = 'API Key 无效或已过期，请检查并更新您的 API Key。';
                    } else if (response.status === 400) {
                        userFriendlyMessage = `请求参数错误：${errorMessage}`;
                    }

                    console.error('[AI Service] Parsed error:', errorMessage);
                } catch {
                    errorMessage = errorText || errorMessage;
                }
            } catch (parseError) {
                console.error('[AI Service] Failed to parse error response:', parseError);
            }

            const finalErrorMessage = userFriendlyMessage || errorMessage;
            console.error('[AI Service] ERROR:', finalErrorMessage);
            return { content: '', error: finalErrorMessage };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        return { content };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[AI Service] EXCEPTION:', errorMessage);
        console.error('[AI Service] Exception details:', err);

        // Provide more specific error messages for common network errors
        let userMessage = errorMessage;
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            userMessage = '网络连接失败，请检查网络连接或 LiteLLM 服务器状态。';
        } else if (errorMessage.includes('timeout')) {
            userMessage = '请求超时，请稍后重试。';
        }

        return { content: '', error: userMessage };
    }
}

/**
 * Generate video prompt using LiteLLM gateway
 */
export async function generateVideoPrompt(
    productDescription: string,
    videoSystemPrompt: string,
    settings: Settings
): Promise<{ prompt: string; error?: string }> {
    console.log('[Video Prompt] ========== GENERATING VIDEO PROMPT ==========');
    console.log('[Video Prompt] LiteLLM Gateway Mode');
    console.log('[Video Prompt] API Mode:', settings.apiMode);
    console.log('[Video Prompt] Base URL:', settings.baseUrl);

    // Determine API Key based on mode
    let apiKey = settings.apiKey;
    let baseUrl = settings.baseUrl;

    if (settings.apiMode === 'internal') {
        console.log('[Video Prompt] Enterprise Mode - Reading from environment variables');
        apiKey = import.meta.env.VITE_LITELLM_API_KEY || '';
        baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'https://litellm.xooer.com/v1';
    }

    // Validate API Key
    if (!apiKey) {
        return { prompt: '', error: 'API Key not configured. Please add your LiteLLM Virtual Key in Settings.' };
    }

    // Use reliable text model for prompt generation
    const model = settings.model || 'gpt-4o';

    const messages: AIMessage[] = [];

    if (videoSystemPrompt && videoSystemPrompt.trim()) {
        messages.push({ role: 'system', content: videoSystemPrompt });
    }

    messages.push({ role: 'user', content: productDescription });

    const requestBody = {
        model,
        messages,
        temperature: 0.7,
        stream: false
    };

    const apiUrl = `${baseUrl}/chat/completions`;

    console.log('[Video Prompt] Endpoint:', apiUrl);
    console.log('[Video Prompt] Model:', model);

    try {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Video Prompt] Error:', errorText);
            return { prompt: '', error: `Failed to generate video prompt: ${response.statusText}` };
        }

        const data = await response.json();
        const prompt = data.choices?.[0]?.message?.content || '';

        console.log('[Video Prompt] Generated prompt length:', prompt.length);
        return { prompt };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[Video Prompt] Exception:', errorMessage);
        return { prompt: '', error: errorMessage };
    }
}

/**
 * Create video generation task
 * Note: Video generation might require specific LiteLLM configuration
 */
export async function createVideoTask(
    prompt: string,
    videoConfig: VideoConfig,
    settings: Settings
): Promise<VideoResponse> {
    console.log('[Video API] ========== CREATE VIDEO TASK ==========');
    console.log('[Video API] LiteLLM Gateway Mode');
    console.log('[Video API] API Mode:', settings.apiMode);
    console.log('[Video API] Base URL:', settings.baseUrl);
    console.log('[Video API] Model:', videoConfig.model);

    // Determine API Key based on mode
    let apiKey = settings.apiKey;
    let baseUrl = settings.baseUrl;

    if (settings.apiMode === 'internal') {
        console.log('[Video API] Enterprise Mode - Reading from environment variables');
        apiKey = import.meta.env.VITE_LITELLM_API_KEY || '';
        baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'https://litellm.xooer.com/v1';
    }

    // Validate API Key
    if (!apiKey) {
        return {
            result: {
                type: 'text',
                status: 'failed',
                content: prompt,
                prompt,
                error: 'API Key not configured. Please add your LiteLLM Virtual Key in Settings.'
            }
        };
    }

    // MOCK MODE FOR TESTING
    if (apiKey === 'mock') {
        console.log('[Video API] MOCK MODE ACTIVE');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            result: {
                type: 'video',
                status: 'completed',
                content: 'Mock video response',
                videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
                duration: videoConfig.duration,
                prompt: prompt,
                progress: 100,
            }
        };
    }

    // Build video generation request
    // Standard LiteLLM/OpenAI-style media generation format
    const requestBody = {
        model: videoConfig.model,
        prompt: prompt,
        duration: videoConfig.duration,
        width: videoConfig.width,
        height: videoConfig.height,
        // Optional parameters for specific providers
        negative_prompt: '',
        quality: 'standard'
    };

    // Unified video endpoint - Plural /videos for LiteLLM Gateway
    const apiUrl = `${baseUrl}/videos`;

    console.log('[Video API] Endpoint:', apiUrl);
    console.log('[Video API] Request body:', JSON.stringify(requestBody, null, 2));

    try {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        console.log('[Video API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Video API] Error:', errorText);

            let detailedError = response.statusText;
            try {
                const errorJson = JSON.parse(errorText);
                detailedError = errorJson.error?.message || errorJson.error || errorJson.detail || response.statusText;
            } catch (e) {
                // Not JSON
            }

            return {
                result: {
                    type: 'text',
                    status: 'failed',
                    content: prompt,
                    prompt,
                    error: `Video generation failed: ${detailedError}`
                },
                error: errorText
            };
        }

        const data = await response.json();
        console.log('[Video API] Response data:', data);

        // Parse response - format depends on LiteLLM configuration
        // This is a simplified version, actual implementation may vary
        const videoUrl = data.video_url || data.choices?.[0]?.message?.video_url;

        if (videoUrl) {
            return {
                result: {
                    type: 'video',
                    status: 'completed',
                    content: data.choices?.[0]?.message?.content || 'Video generated successfully',
                    videoUrl,
                    duration: videoConfig.duration,
                    prompt,
                    progress: 100,
                }
            };
        } else {
            // If no video URL, might be a task ID for polling
            const taskId = data.task_id || data.id;
            return {
                result: {
                    type: 'video',
                    status: 'processing',
                    content: 'Video generation in progress',
                    taskId,
                    prompt,
                    progress: 0,
                }
            };
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[Video API] Exception:', errorMessage);
        return {
            result: {
                type: 'text',
                status: 'failed',
                content: prompt,
                prompt,
                error: errorMessage
            },
            error: errorMessage
        };
    }
}

/**
 * Poll video generation status
 */
export async function pollVideoTask(
    taskId: string,
    settings: Settings
): Promise<VideoResponse> {
    console.log('[Video Poll] Polling task:', taskId);

    // Determine API Key based on mode
    let apiKey = settings.apiKey;
    let baseUrl = settings.baseUrl;

    if (settings.apiMode === 'internal') {
        apiKey = import.meta.env.VITE_LITELLM_API_KEY || '';
        baseUrl = import.meta.env.VITE_LITELLM_BASE_URL || 'https://litellm.xooer.com/v1';
    }

    if (!apiKey) {
        return {
            result: {
                type: 'text',
                status: 'failed',
                content: '',
                prompt: '',
                error: 'API Key not configured'
            }
        };
    }

    // Polling endpoint - /v1/videos/{id} based on LiteLLM OpenAPI schema
    const apiUrl = `${baseUrl}/videos/${taskId}`;

    try {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Video Poll] Error:', errorText);
            return {
                result: {
                    type: 'text',
                    status: 'failed',
                    content: '',
                    prompt: '',
                    error: `Polling failed: ${response.statusText}`
                }
            };
        }

        const data = await response.json();
        console.log('[Video Poll] Status:', data.status);

        // Parse polling response
        if (data.status === 'completed' && data.video_url) {
            return {
                result: {
                    type: 'video',
                    status: 'completed',
                    content: 'Video generated successfully',
                    videoUrl: data.video_url,
                    taskId,
                    prompt: data.prompt || '',
                    progress: 100,
                }
            };
        } else if (data.status === 'failed') {
            return {
                result: {
                    type: 'text',
                    status: 'failed',
                    content: '',
                    prompt: data.prompt || '',
                    error: data.error || 'Video generation failed'
                }
            };
        } else {
            // Still processing
            return {
                result: {
                    type: 'video',
                    status: 'processing',
                    content: 'Video generation in progress',
                    taskId,
                    prompt: data.prompt || '',
                    progress: data.progress || 0,
                }
            };
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[Video Poll] Exception:', errorMessage);
        return {
            result: {
                type: 'text',
                status: 'failed',
                content: '',
                prompt: '',
                error: errorMessage
            }
        };
    }
}

/**
 * Test model connectivity
 */
export async function testModel(settings: Settings): Promise<{ success: boolean; message: string }> {
    console.log('[Model Test] Testing model:', settings.model);

    try {
        const testResponse = await sendToAI(
            'Hello, this is a test message. Please respond with "Test successful".',
            settings,
            {
                systemPrompt: 'You are a helpful assistant. Respond briefly.',
                outputLanguage: 'en',
                outputFormat: 'text',
                enableWebSearch: false,
                reasoningEffort: 'low'
            }
        );

        if (testResponse.error) {
            return {
                success: false,
                message: `Model test failed: ${testResponse.error}`
            };
        }

        return {
            success: true,
            message: `Model test successful! Response: ${testResponse.content.substring(0, 100)}...`
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            message: `Model test exception: ${errorMessage}`
        };
    }
}

// Export types for backward compatibility
export type { AIMessage, AIResponse, VideoResponse };

// Alias for backward compatibility
export const generateVideo = createVideoTask;
