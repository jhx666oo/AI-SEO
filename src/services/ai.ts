import { Settings, AIConfig, VideoConfig, VideoGenerationResult, VIDEO_MODELS } from '@/types';

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

// Commercialization logic settings (Hybrid Mode: Dev + Production)
// 开发环境：直连各供应商（使用环境变量）
// 生产环境：统一走代理服务（安全）

const isProduction = import.meta.env.MODE === 'production';
const proxyBaseUrl = import.meta.env.VITE_PROXY_BASE_URL || 'https://api.yourcompany.com/v1/ai-proxy';
const sessionToken = import.meta.env.VITE_INTERNAL_SESSION_TOKEN || 'internal-session-token';

const INTERNAL_API_CONFIG: Record<string, { baseUrl: string; apiKey: string }> = {
  doubao: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_DOUBAO_API_KEY || 'YOUR_DOUBAO_API_KEY'),
  },
  qwen: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_QWEN_API_KEY || 'YOUR_QWEN_API_KEY'),
  },
  gpt: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://api.openai.com/v1',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'),
  },
  grok: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://api.x.ai/v1',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_GROK_API_KEY || 'YOUR_GROK_API_KEY'),
  },
  gemini: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GOOGLE_API_KEY'),
  },
  perplexity: {
    baseUrl: isProduction ? proxyBaseUrl : 'https://api.perplexity.ai',
    apiKey: isProduction ? sessionToken : (import.meta.env.VITE_PERPLEXITY_API_KEY || 'YOUR_PERPLEXITY_API_KEY'),
  },
};

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
  try {
    console.log('[Audit Trail] Logging activity:', data);
    // Asynchronous call to company backend
    fetch('https://api.yourcompany.com/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => console.error('[Audit Trail] Failed to log activity:', err));
  } catch (err) {
    console.error('[Audit Trail] Error in logUserActivity:', err);
  }
}

export async function sendToAI(
  userContent: string,
  settings: Settings,
  aiConfig: AIConfig
): Promise<AIResponse> {
  console.log('[AI Service] ========== AI REQUEST STARTED ==========');

  const isInternal = settings.apiMode === 'internal';
  const provider = settings.provider;

  // Resolve config based on mode and provider
  const internalConfig = INTERNAL_API_CONFIG[provider] || INTERNAL_API_CONFIG.gpt;
  const baseUrl = isInternal ? internalConfig.baseUrl : settings.baseUrl;
  const apiKey = isInternal ? internalConfig.apiKey : settings.apiKey;

  console.log('[AI Service] Mode:', settings.apiMode);
  console.log('[AI Service] Provider:', provider);
  console.log('[AI Service] Base URL:', baseUrl);

  if (!apiKey && !isInternal) {
    const errorMsg = 'API Key not configured. Please add your API key in Settings.';
    return { content: '', error: errorMsg };
  }

  // MOCK MODE FOR TESTING
  if (apiKey === 'mock') {
    console.log('[AI Service] MOCK MODE ACTIVE');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      content: `[MOCK RESPONSE for ${settings.model}]\n\n**Meta Title**: ${settings.brandName || 'Product'} SEO Title\n**Meta Description**: This is a mock SEO description for ${settings.companyName || 'the company'}.\n\nHere is your SEO blog content...`
    };
  }

  if (!baseUrl) {
    const errorMsg = 'Base URL not configured. Please check your settings.';
    return { content: '', error: errorMsg };
  }

  // Audit Trail Logging
  logUserActivity({
    brandName: settings.brandName || 'Unknown',
    companyName: settings.companyName || 'Unknown',
    pageUrl: window.location.href, // Or get from aiConfig if available
    provider: provider,
    model: settings.model,
  });

  const messages: AIMessage[] = [
    { role: 'system', content: aiConfig.systemPrompt },
    { role: 'user', content: userContent }
  ];

  // Unified Request Body Template
  let requestBody: any = {
    model: settings.model,
    messages: messages,
    temperature: 0.7,
  };

  // Provider-specific adjustments
  if (provider === 'grok') {
    // Example for Grok specific format
  }

  // Add optional parameters
  if (aiConfig.enableWebSearch && provider !== 'gemini') {
    requestBody.web_search = true;
  }

  const reasoningMap: Record<string, number> = {
    'low': 0.3,
    'medium': 0.7,
    'high': 1.0,
  };
  requestBody.temperature = reasoningMap[aiConfig.reasoningEffort] || 0.7;

  // Final provider-specific cleanup
  if (provider === 'gemini') {
    // Ensure gemini models are prefixed and remove any OpenAI-specific fields that might cause 400
    if (!requestBody.model.startsWith('models/')) {
      if (requestBody.model.toLowerCase().includes('gemini')) {
        requestBody.model = `models/${requestBody.model.toLowerCase()}`;
      }
    }
  }

  // Production mode: add provider info for proxy routing
  if (isProduction && isInternal) {
    requestBody.provider = provider;
  }

  const apiUrl = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[AI Service] Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error('[AI Service] Error response body:', errorText.substring(0, 500));
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
          console.error('[AI Service] Parsed error:', errorMessage);
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.error('[AI Service] Failed to parse error response:', parseError);
      }

      console.error('[AI Service] ERROR:', errorMessage);
      return { content: '', error: errorMessage };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { content };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[AI Service] EXCEPTION:', errorMessage);

    // Provide more specific error messages for common network errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      const networkError = 'Network error: Unable to connect to API. Please check your internet connection and Base URL.';
      console.error('[AI Service] Network error detected');
      return { content: '', error: networkError };
    }

    if (errorMessage.includes('CORS')) {
      const corsError = 'CORS error: API server does not allow requests from this origin.';
      console.error('[AI Service] CORS error detected');
      return { content: '', error: corsError };
    }

    console.error('[AI Service] ========== AI REQUEST FAILED ==========');
    return { content: '', error: errorMessage };
  }
}

// Legacy function for backwards compatibility
export function buildPrompt(
  pageContent: string,
  formatTemplate: string,
  formatType: 'json' | 'xml' | 'custom'
): string {
  let formatInstruction = '';

  if (formatType === 'json') {
    formatInstruction = `Please analyze the content and return the result in the following JSON format. Only return valid JSON, no other text:

\`\`\`json
${formatTemplate}
\`\`\``;
  } else if (formatType === 'xml') {
    formatInstruction = `Please analyze the content and return the result in the following XML format. Only return valid XML, no other text:

\`\`\`xml
${formatTemplate}
\`\`\``;
  } else {
    formatInstruction = formatTemplate;
  }

  return `${formatInstruction}

---

Here is the content to analyze:

${pageContent}`;
}

// Generate video prompt using text AI model
export async function generateVideoPrompt(
  productDescription: string,
  videoSystemPrompt: string,
  settings: Settings
): Promise<{ prompt: string; error?: string }> {
  console.log('[Video Prompt] ========== GENERATING VIDEO PROMPT ==========');

  const isInternal = settings.apiMode === 'internal';
  const baseUrl = isInternal ? INTERNAL_API_CONFIG.baseUrl : settings.baseUrl;
  const apiKey = isInternal ? INTERNAL_API_CONFIG.apiKey : settings.apiKey;

  if (!apiKey && !isInternal) {
    return { prompt: '', error: 'API Key not configured. Please add your key in Settings.' };
  }

  const promptMessages: AIMessage[] = [
    { role: 'system', content: videoSystemPrompt },
    { role: 'user', content: productDescription }
  ];

  try {
    const textApiUrl = `${baseUrl}/chat/completions`;
    console.log('[Video Prompt] Calling API:', textApiUrl);

    const response = await fetch(textApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: promptMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { prompt: '', error: `Prompt API Error: ${response.status} - ${errorText.substring(0, 100)}` };
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content || '';
    return { prompt: generatedPrompt };
  } catch (err) {
    console.error('[Video Prompt] Exception:', err);
    return { prompt: '', error: String(err) };
  }
}

// Parse video URL from POE model response
// Video models may return URLs in different formats:
// 1. Direct URL: https://...mp4
// 2. Markdown: ![video](https://...mp4) or [video](https://...)
// 3. JSON: {"video_url": "https://..."}
// 4. Plain text with URL embedded
function parseVideoUrlFromResponse(content: string): string | null {
  if (!content) return null;

  console.log('[Video Parse] Parsing response for video URL...');
  console.log('[Video Parse] Content length:', content.length, 'chars');
  console.log('[Video Parse] Content preview:', content.substring(0, 500));

  // Try to parse as JSON first
  try {
    const json = JSON.parse(content);
    if (json.video_url) return json.video_url;
    if (json.url) return json.url;
    if (json.videoUrl) return json.videoUrl;
    if (json.data?.video_url) return json.data.video_url;
    if (json.result?.url) return json.result.url;
  } catch {
    // Not JSON, continue with other methods
  }

  // Try to find a URL that looks like a video file or a hosted video page
  // Broadened to include common cloud storage and video hosting markers
  const urlRegex = /(https?:\/\/[^\s"'<>]+(?:\.mp4|\.mov|\.webm|\/video\/|v\.|\/v\/|aws|blob|cdn|poecdn|hopp\.io|kling|runway)[^\s"'<>]*)/gi;
  const matches = content.match(urlRegex);

  if (matches && matches.length > 0) {
    // Return the first match that isn't obviously a static image unless no other choice
    for (const url of matches) {
      if (/\.(mp4|mov|webm|m4v)/i.test(url) || url.includes('/video/') || url.includes('poecdn') || url.includes('hopp.io')) {
        console.log('[Video Parse] Selected URL:', url);
        return url;
      }
    }
    return matches[0];
  }

  console.log('[Video Parse] No video URL found in response');
  return null;
}

// Create video using Video Generation API
export async function createVideoTask(
  prompt: string,
  videoConfig: VideoConfig,
  settings: Settings
): Promise<VideoResponse> {
  const isInternal = settings.apiMode === 'internal';
  const baseUrl = isInternal ? INTERNAL_API_CONFIG.baseUrl : settings.baseUrl;
  const apiKey = isInternal ? INTERNAL_API_CONFIG.apiKey : settings.apiKey;

  if (!apiKey && !isInternal) {
    return {
      result: { type: 'text', status: 'failed', content: prompt, prompt },
      error: 'API Key not configured.'
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

  const modelConfig = VIDEO_MODELS.find(m => m.name === videoConfig.model);

  try {
    console.log('[Video API] ========== VIDEO GENERATION REQUEST ==========');
    console.log('[Video API] Mode:', settings.apiMode);

    // Build the video generation prompt with parameters
    let videoPrompt = prompt;
    const videoParams = [];
    if (videoConfig.duration) videoParams.push(`Duration: ${videoConfig.duration}s`);
    if (videoConfig.width && videoConfig.height) videoParams.push(`Res: ${videoConfig.width}x${videoConfig.height}`);

    if (videoParams.length > 0) {
      videoPrompt = `${prompt}\n\n[Specs: ${videoParams.join(', ')}]`;
    }

    // Prepare request message
    const messages: AIMessage[] = [];
    if (videoConfig.useImageReference && videoConfig.referenceImageUrl && modelConfig?.supportsImageReference) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: videoPrompt },
          { type: 'image_url', image_url: { url: videoConfig.referenceImageUrl } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: videoPrompt });
    }

    const requestBody = {
      model: videoConfig.model,
      messages: messages,
      temperature: 0.7,
    };

    const apiUrl = `${baseUrl}/chat/completions`;
    console.log('[Video API] Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    if (!response.ok) {
      return {
        result: { type: 'text', status: 'failed', content: prompt, prompt },
        error: `API Error: ${response.status}`
      };
    }


    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        result: { type: 'text', status: 'failed', content: prompt, prompt },
        error: 'Invalid response from AI API'
      };
    }

    const responseContent = data.choices?.[0]?.message?.content || '';
    console.log('[Video API] Response content:', responseContent.substring(0, 500));

    // Try to parse video URL from the response
    const videoUrl = parseVideoUrlFromResponse(responseContent);

    if (videoUrl) {
      console.log('[Video API] SUCCESS - Video URL found:', videoUrl);
      return {
        result: {
          type: 'video',
          status: 'completed',
          content: responseContent,
          videoUrl: videoUrl,
          duration: videoConfig.duration,
          prompt: prompt,
          progress: 100,
        }
      };
    }

    // No video URL found - return the text content
    // This might happen if the model doesn't support video or returns text instead
    console.log('[Video API] No video URL found, returning text response');
    return {
      result: {
        type: 'text',
        status: 'completed',
        content: responseContent,
        prompt: prompt,
        progress: 100,
      }
    };
  } catch (err) {
    console.error('[Video API] Exception:', err);
    return {
      result: { type: 'text', status: 'failed', content: prompt, prompt },
      error: String(err)
    };
  }
}

// Poll video task status
export async function pollVideoTask(
  taskId: string,
  settings: Settings
): Promise<VideoResponse> {
  const isInternal = settings.apiMode === 'internal';
  const baseUrl = isInternal ? INTERNAL_API_CONFIG.baseUrl : settings.baseUrl;
  const apiKey = isInternal ? INTERNAL_API_CONFIG.apiKey : settings.apiKey;

  console.log(`[Video API] Polling task ${taskId} at ${baseUrl}`);

  // MOCK MODE
  if (apiKey === 'mock') {
    return {
      result: {
        type: 'video',
        status: 'completed',
        content: 'Mock polled video response',
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        progress: 100,
      }
    };
  }

  // Implementation varies by provider. For now, returning pending/stub
  return {
    result: {
      type: 'pending',
      status: 'processing',
      content: 'Polling Not Fully Implemented for this provider',
      taskId: taskId,
      progress: 50,
    }
  };
}

// Combined function for video generation
// Step 1: Generate video prompt using text model
// Step 2: Call video model with the prompt
export async function generateVideo(
  productDescription: string,
  videoSystemPrompt: string,
  videoConfig: VideoConfig,
  settings: Settings
): Promise<VideoResponse> {
  console.log('[generateVideo] ========== VIDEO GENERATION STARTED ==========');
  console.log('[generateVideo] Step 1: Generating video prompt using Text AI...');

  // Step 1: Generate the video prompt using text AI
  const promptResult = await generateVideoPrompt(productDescription, videoSystemPrompt, settings);

  if (promptResult.error || !promptResult.prompt) {
    console.error('[generateVideo] Step 1 FAILED:', promptResult.error);
    return {
      result: { type: 'text', status: 'failed', content: '' },
      error: promptResult.error || 'Failed to generate video prompt'
    };
  }

  console.log('[generateVideo] Step 1 SUCCESS - Prompt generated');
  console.log('[generateVideo] Step 2: Calling Video Model...');
  console.log('[generateVideo] Video Model:', videoConfig.model);

  // Step 2: Call the video model with the generated prompt
  const videoResult = await createVideoTask(promptResult.prompt, videoConfig, settings);

  console.log('[generateVideo] Step 2 Result:', videoResult.error ? 'FAILED' : 'SUCCESS');
  if (videoResult.error) {
    console.error('[generateVideo] Step 2 Error:', videoResult.error.substring(0, 200));
  }

  // Preserve the generated prompt in the result
  if (videoResult.result) {
    videoResult.result.prompt = promptResult.prompt;
  }

  return videoResult;
}
