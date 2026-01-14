import { Settings, AIConfig, VideoConfig, VideoGenerationResult, VIDEO_MODELS, ChromeMessage } from '@/types';

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
// 生产环境：如果有 VITE_PROXY_BASE_URL，统一走代理服务（安全）
//          如果 VITE_PROXY_BASE_URL 为空，回退到各供应商官方地址（紧急测试用，有跨域风险）

const isProduction = import.meta.env.MODE === 'production';
const proxyBaseUrl = import.meta.env.VITE_PROXY_BASE_URL || '';
const sessionToken = import.meta.env.VITE_INTERNAL_SESSION_TOKEN || 'internal-session-token';

// Determine if we should use proxy (only when production AND proxyBaseUrl is provided)
const useProxy = isProduction && proxyBaseUrl;

const INTERNAL_API_CONFIG: Record<string, { baseUrl: string; apiKey: string }> = {
  doubao: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_DOUBAO_API_KEY || ''),
  },
  qwen: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_QWEN_API_KEY || ''),
  },
  gpt: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://api.openai.com/v1',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_OPENAI_API_KEY || ''),
  },
  grok: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://api.x.ai/v1',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_GROK_API_KEY || ''),
  },
  gemini: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_GEMINI_API_KEY || ''),
  },
  perplexity: {
    baseUrl: useProxy ? proxyBaseUrl : 'https://api.perplexity.ai',
    apiKey: useProxy ? sessionToken : (import.meta.env.VITE_PERPLEXITY_API_KEY || ''),
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
  console.log('[Audit Trail] Logging activity:', data);
  // Disabled failing internal audit fetch for now to prevent console noise
  return;
  /*
  try {
    const response = await fetch('https://api.yourcompany.com/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!response.ok) console.warn('[Audit Trail] Logging failed');
  } catch (err) {
    console.error('[Audit Trail] Error in logUserActivity:', err);
  }
  */
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
  console.log('[AI Service] isProduction:', isProduction);
  console.log('[AI Service] Vite Mode:', import.meta.env.MODE);
  console.log('[AI Service] Provider:', provider);
  console.log('[AI Service] Base URL:', baseUrl);
  console.log('[AI Service] Resolved API Key Length:', apiKey ? apiKey.length : 'undefined/empty');
  console.log('[AI Service] Resolved API Key Start:', apiKey ? apiKey.substring(0, 6) + '...' : 'none');

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

  /**
   * Normalize model name to official API format based on provider
   * - OpenAI: lowercase (GPT-4o -> gpt-4o)
   * - Perplexity: lowercase with hyphens (Sonar Pro -> sonar-pro)
   * - Doubao: Use as-is (should be Endpoint ID like ep-xxx)
   * - Others: lowercase generally
   */
  function normalizeModelName(modelName: string, provider: string): string {
    const original = modelName.trim();
    
    // Doubao: Model field should contain Endpoint ID (ep-xxx), not model name
    // User should provide endpoint ID directly, we use it as-is
    if (provider === 'doubao') {
      // If it doesn't start with 'ep-', warn but use as-is (user might provide endpoint ID)
      if (!original.toLowerCase().startsWith('ep-')) {
        console.warn('[AI Service] Doubao: Model field should be Endpoint ID (ep-xxx), got:', original);
      }
      return original; // Use as-is for Doubao (endpoint IDs)
    }
    
    // Perplexity: Convert to lowercase with hyphens
    // "Sonar Pro" -> "sonar-pro"
    // "Sonar Reasoning Pro" -> "sonar-reasoning-pro"
    if (provider === 'perplexity') {
      const perplexityMap: Record<string, string> = {
        'sonar': 'sonar',
        'Sonar': 'sonar',
        'sonar pro': 'sonar-pro',
        'Sonar Pro': 'sonar-pro',
        'sonar reasoning pro': 'sonar-reasoning-pro',
        'Sonar Reasoning Pro': 'sonar-reasoning-pro',
        'sonar deep research': 'sonar-deep-research',
        'Sonar Deep Research': 'sonar-deep-research',
      };
      const normalized = perplexityMap[original] || original.toLowerCase().replace(/\s+/g, '-');
      console.log('[AI Service] Perplexity model normalized:', original, '->', normalized);
      return normalized;
    }
    
    // OpenAI: Convert to lowercase and handle special model ID mappings
    // "GPT-4o" -> "gpt-4o"
    // "GPT-o3" -> "o3-mini" (official ID)
    if (provider === 'gpt') {
      const lower = original.toLowerCase();
      // Handle special cases - map display names to official API IDs
      const gptMap: Record<string, string> = {
        'gpt-4o': 'gpt-4o',
        'GPT-4o': 'gpt-4o',
        'gpt-o3': 'o3-mini',        // GPT-o3 -> official ID: o3-mini
        'GPT-o3': 'o3-mini',        // GPT-o3 -> official ID: o3-mini
        'GPT-4o-mini': 'gpt-4o-mini',
        'gpt-5': 'gpt-5',
        'gpt-5-mini': 'gpt-5-mini',
        'gpt-5.1': 'gpt-5.1',
        'gpt-5.2': 'gpt-5.2',
        'o1': 'o1',
        'o1-preview': 'o1-preview',
        'o1-mini': 'o1-mini',
        'o3': 'o3',
        'o3-mini': 'o3-mini',
      };
      return gptMap[original] || gptMap[lower] || lower;
    }
    
    // Qwen: Handle special model name mappings
    if (provider === 'qwen') {
      const qwenMap: Record<string, string> = {
        'qwen3-max': 'qwen-max',      // qwen3-max -> official ID: qwen-max
        'Qwen3-max': 'qwen-max',
        'QWEN3-MAX': 'qwen-max',
      };
      const normalized = qwenMap[original] || qwenMap[original.toLowerCase()] || original.toLowerCase();
      console.log('[AI Service] Qwen model normalized:', original, '->', normalized);
      return normalized;
    }
    
    // Gemini: Map to official API model IDs and ensure lowercase
    if (provider === 'gemini') {
      const geminiMap: Record<string, string> = {
        'gemini-3-pro-preview': 'gemini-3-pro-preview',
        'Gemini-3-Pro-Preview': 'gemini-3-pro-preview',
        'GEMINI-3-PRO-PREVIEW': 'gemini-3-pro-preview',
        'gemini-3-flash-preview': 'gemini-3-flash-preview',
        'Gemini-3-Flash-Preview': 'gemini-3-flash-preview',
        'GEMINI-3-FLASH-PREVIEW': 'gemini-3-flash-preview',
        'gemini-2.5-pro': 'gemini-2.5-pro',
        'Gemini-2.5-Pro': 'gemini-2.5-pro',
        'GEMINI-2.5-PRO': 'gemini-2.5-pro',
        'gemini-2.5-flash': 'gemini-2.5-flash',
        'Gemini-2.5-Flash': 'gemini-2.5-flash',
        'GEMINI-2.5-FLASH': 'gemini-2.5-flash',
        'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
        'Gemini-2.5-Flash-Lite': 'gemini-2.5-flash-lite',
        'GEMINI-2.5-FLASH-LITE': 'gemini-2.5-flash-lite',
        'gemini-2.0-flash': 'gemini-2.0-flash',
        'Gemini-2.0-Flash': 'gemini-2.0-flash',
        'GEMINI-2.0-FLASH': 'gemini-2.0-flash',
      };
      const normalized = geminiMap[original] || geminiMap[original.toLowerCase()] || original.toLowerCase();
      console.log('[AI Service] Gemini model normalized:', original, '->', normalized);
      return normalized;
    }
    
    // Default: Convert to lowercase for other providers
    return original.toLowerCase();
  }

  // Normalize model name based on provider requirements
  const normalizedModel = normalizeModelName(settings.model, provider);
  console.log('[AI Service] Model name normalized:', settings.model, '->', normalizedModel);

  // Unified Request Body Template
  let requestBody: any = {
    model: normalizedModel,
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

  // Special handling for reasoning models - they only support temperature = 1
  // Includes: o1, o3 series, and gpt-5 series models
  const modelsWithFixedTemperature = [
    'o3', 'o3-mini',              // O3 series
    'o1', 'o1-preview', 'o1-mini', // O1 series
    'gpt-5', 'gpt-5-mini', 'gpt-5.1', 'gpt-5.2', // GPT-5 series
  ];
  const modelLower = requestBody.model.toLowerCase();
  const isFixedTemperatureModel = modelsWithFixedTemperature.some(m => 
    modelLower === m.toLowerCase() || modelLower.includes(m.toLowerCase())
  );
  
  if (isFixedTemperatureModel) {
    // Reasoning and GPT-5 models only support temperature = 1 (default)
    // Force temperature to 1 for these models to avoid 400 errors
    requestBody.temperature = 1;
    console.log('[AI Service] Fixed-temperature model detected, setting temperature to 1:', requestBody.model);
  } else {
  const reasoningMap: Record<string, number> = {
    'low': 0.3,
    'medium': 0.7,
    'high': 1.0,
  };
  requestBody.temperature = reasoningMap[aiConfig.reasoningEffort] || 0.7;
  }
  
  // Ensure OpenAI model names are lowercase before sending to API
  if (provider === 'gpt') {
    requestBody.model = requestBody.model.toLowerCase();
    console.log('[AI Service] Final OpenAI model name (lowercase):', requestBody.model);
  }

  // Final provider-specific cleanup for Gemini
  if (provider === 'gemini') {
    // Gemini models should already be normalized to lowercase by normalizeModelName
    // Map to official API model IDs and ensure correct format
    const geminiMap: Record<string, string> = {
      'gemini-3-pro-preview': 'gemini-3-pro-preview',
      'gemini-3-flash-preview': 'gemini-3-flash-preview',
      'gemini-2.5-pro': 'gemini-2.5-pro',
      'gemini-2.5-flash': 'gemini-2.5-flash',
      'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
      'gemini-2.0-flash': 'gemini-2.0-flash',
    };

    const modelLower = requestBody.model.toLowerCase();
    // Use direct mapping if available, otherwise use pattern matching
    if (geminiMap[modelLower]) {
      requestBody.model = geminiMap[modelLower];
    } else {
      // Pattern matching for flexible input (model should already be lowercase)
      if (modelLower.includes('3') && modelLower.includes('pro') && modelLower.includes('preview')) {
        requestBody.model = 'gemini-3-pro-preview';
      } else if (modelLower.includes('3') && modelLower.includes('flash') && modelLower.includes('preview')) {
        requestBody.model = 'gemini-3-flash-preview';
      } else if (modelLower.includes('2.5') && modelLower.includes('pro')) {
        requestBody.model = 'gemini-2.5-pro';
      } else if (modelLower.includes('2.5') && modelLower.includes('flash') && modelLower.includes('lite')) {
        requestBody.model = 'gemini-2.5-flash-lite';
      } else if (modelLower.includes('2.5') && modelLower.includes('flash')) {
        requestBody.model = 'gemini-2.5-flash';
      } else if (modelLower.includes('2.0') && modelLower.includes('flash')) {
        requestBody.model = 'gemini-2.0-flash';
      } else {
        // Use as-is (should already be lowercase from normalizeModelName)
        requestBody.model = modelLower;
      }
    }
    
    // Ensure model name is lowercase (final safety check)
    requestBody.model = requestBody.model.toLowerCase();
    console.log('[AI Service] Final Gemini model name:', requestBody.model);

    // Google's OpenAI-compatible endpoint has issues with system role
    // Merge system prompt into first user message
    if (requestBody.messages && requestBody.messages.length > 0) {
      const messages = [...requestBody.messages];
      const systemMsg = messages.find((m: any) => m.role === 'system');
      const userMsg = messages.find((m: any) => m.role === 'user');

      if (systemMsg && userMsg) {
        userMsg.content = `${typeof systemMsg.content === 'string' ? systemMsg.content : JSON.stringify(systemMsg.content)}\n\n${typeof userMsg.content === 'string' ? userMsg.content : JSON.stringify(userMsg.content)}`;
        requestBody.messages = messages.filter((m: any) => m.role !== 'system');
      }
    }

    // Remove 'models/' prefix if present - OpenAI compatible endpoint uses format without prefix
    if (requestBody.model.startsWith('models/')) {
      requestBody.model = requestBody.model.replace('models/', '');
    }

    // Final validation: ensure model name is lowercase (required by OpenAI compatible endpoint)
    requestBody.model = requestBody.model.toLowerCase();
    
    console.log('[AI Service] Final Gemini model name:', requestBody.model);
  }

  // Proxy mode: add provider info for proxy routing
  if (useProxy && isInternal) {
    requestBody.provider = provider;
  }

  const isGeminiDirect = provider === 'gemini' && !useProxy;
  let apiUrl = `${baseUrl}/chat/completions`;
  const cleanKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : '';

  if (isGeminiDirect && cleanKey) {
    // Adding to both URL and Header for maximum compatibility
    apiUrl += `?key=${cleanKey}`;
  }

  console.log('[AI Service] Resolved API Key Start:', cleanKey ? cleanKey.substring(0, 7) + '...' : 'none/empty');
  console.log('[AI Service] Endpoint:', apiUrl);
  console.log('[AI Service] Resolved Model:', requestBody.model);

  if (isInternal && !cleanKey) {
    throw new Error(`Internal mode error: API Key for provider "${provider}" is missing. Please check your .env file and ensure it contains VITE_${provider.toUpperCase()}_API_KEY.`);
  }

  try {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (cleanKey) {
      // Always try to include Authorization header, even for Google in dev
      // Some proxies or local tunnels might need it
      headers['Authorization'] = `Bearer ${cleanKey}`;

      if (provider === 'gemini') {
        headers['x-goog-api-key'] = cleanKey;
      }
    }

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
          
          // Extract error code if available
          const errorCode = errorData.error?.code || errorData.code;
          
          // Handle specific error cases with user-friendly messages
          if (response.status === 403) {
            // API Key leaked or invalid
            if (errorMessage.toLowerCase().includes('leaked') || 
                errorMessage.toLowerCase().includes('reported') ||
                errorMessage.toLowerCase().includes('permission_denied')) {
              userFriendlyMessage = 'API Key 已失效或被报告为泄露，请更换 API Key。';
            } else {
              userFriendlyMessage = 'API Key 权限不足，请检查 API Key 是否有效。';
            }
          } else if (response.status === 404) {
            // Model not found - check for common typos
            if (errorMessage.toLowerCase().includes('model') && errorMessage.toLowerCase().includes('not found')) {
              // Check for common typos (mixed case like "GPT-4o" should be "gpt-4o")
              // Note: Model name has already been normalized, but we check the original setting
              const originalModelName = settings.model || requestBody.model;
              if (originalModelName !== originalModelName.toLowerCase() && provider === 'gpt') {
                userFriendlyMessage = `模型不存在：${originalModelName}。提示：OpenAI 模型名称应为全小写，如 "gpt-4o" 而非 "${originalModelName}"。请检查拼写是否正确。`;
              } else {
                userFriendlyMessage = `模型不存在：${requestBody.model}。请检查模型名称是否正确，或确认您的账户有权限访问此模型。`;
              }
            } else {
              userFriendlyMessage = `资源不存在 (404)：${errorMessage}`;
            }
          } else if (response.status === 401) {
            userFriendlyMessage = 'API Key 无效或已过期，请检查并更新您的 API Key。';
          } else if (response.status === 400) {
            // Check for temperature errors (o3, o1 models)
            if (errorMessage.toLowerCase().includes('temperature')) {
              userFriendlyMessage = `参数错误：${errorMessage}。提示：o1 和 o3 模型仅支持 temperature = 1。`;
            } else {
              userFriendlyMessage = `请求参数错误：${errorMessage}`;
            }
          }
          
          console.error('[AI Service] Parsed error:', errorMessage);
          if (errorCode) {
            console.error('[AI Service] Error code:', errorCode);
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.error('[AI Service] Failed to parse error response:', parseError);
      }

      // Use user-friendly message if available, otherwise use technical message
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
    console.error('[AI Service] Request URL was:', apiUrl);
    console.error('[AI Service] Request body:', JSON.stringify(requestBody, null, 2));

    // Provide more specific error messages for common network errors
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
      const networkError = `Network error: Unable to connect to API endpoint "${apiUrl}". Please check your internet connection and verify the Base URL is correct. For Gemini, ensure you're using the correct endpoint: https://generativelanguage.googleapis.com/v1beta/openai`;
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
  const config = isInternal 
    ? (INTERNAL_API_CONFIG[settings.provider] || INTERNAL_API_CONFIG.gpt)
    : { baseUrl: settings.baseUrl, apiKey: settings.apiKey };
  const baseUrl = config.baseUrl;
  const apiKey = config.apiKey;

  if (!apiKey && !isInternal) {
    return { prompt: '', error: 'API Key not configured. Please add your key in Settings.' };
  }

  // Use reliable text model for prompt generation, not video model ID
  // Map provider to appropriate text model
  const textModelMap: Record<string, string> = {
    doubao: 'doubao-pro-128k',
    qwen: 'qwen-max-2025',
    gpt: 'gpt-5.1',
    grok: 'Grok-4',
    gemini: 'gemini-2.5-pro', // Use flash for faster prompt generation
    perplexity: 'sonar-pro',
  };
  const textModel = textModelMap[settings.provider] || 'gpt-4o';
  console.log('[Video Prompt] Using text model:', textModel, 'for provider:', settings.provider);

  const promptMessages: AIMessage[] = [
    { role: 'system', content: videoSystemPrompt },
    { role: 'user', content: productDescription }
  ];

  let requestBody: any = {
    model: textModel,
    messages: promptMessages,
    temperature: 0.7,
  };

  // Gemini-specific adjustments
  if (settings.provider === 'gemini') {
    // Map to lowercase format
    if (requestBody.model.includes('gemini')) {
      requestBody.model = requestBody.model.toLowerCase();
    }
    // Remove 'models/' prefix if present
    if (requestBody.model.startsWith('models/')) {
      requestBody.model = requestBody.model.replace('models/', '');
    }

    // Merge system prompt into user message for Gemini
    if (requestBody.messages && requestBody.messages.length > 0) {
      const messages = [...requestBody.messages];
      const systemMsg = messages.find((m: any) => m.role === 'system');
      const userMsg = messages.find((m: any) => m.role === 'user');

      if (systemMsg && userMsg) {
        userMsg.content = `${typeof systemMsg.content === 'string' ? systemMsg.content : JSON.stringify(systemMsg.content)}\n\n${typeof userMsg.content === 'string' ? userMsg.content : JSON.stringify(userMsg.content)}`;
        requestBody.messages = messages.filter((m: any) => m.role !== 'system');
      }
    }
  }

  try {
    const cleanKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : '';
    const isGeminiDirect = settings.provider === 'gemini' && !useProxy;
    let textApiUrl = `${baseUrl}/chat/completions`;

    // Add key parameter for Gemini in development mode
    if (isGeminiDirect && cleanKey) {
      textApiUrl += `?key=${cleanKey}`;
    }

    console.log('[Video Prompt] Calling API:', textApiUrl);
    console.log('[Video Debug] Requesting model:', requestBody.model, 'at', textApiUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cleanKey) {
      headers['Authorization'] = `Bearer ${cleanKey}`;
      if (settings.provider === 'gemini') {
        headers['x-goog-api-key'] = cleanKey;
      }
    }
    
    const response = await fetch(textApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Video Prompt] API Error:', response.status, errorText.substring(0, 200));
      return { prompt: '', error: `Prompt API Error: ${response.status} - ${errorText.substring(0, 100)}` };
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content || '';
    console.log('[Video Prompt] Generated prompt length:', generatedPrompt.length);
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
// 3. JSON: {"video_url": "https://..."} or nested JSON
// 4. Plain text with URL embedded
// 5. Gemini 2026 format: JSON blocks or markdown code blocks containing URLs
function parseVideoUrlFromResponse(content: string): string | null {
  if (!content) return null;
  
  console.log('[Video Parse] Parsing response for video URL...');
  console.log('[Video Parse] Content length:', content.length, 'chars');
  console.log('[Video Parse] Content preview:', content.substring(0, 500));
  
  // Try to parse as complete JSON first
  try {
    const json = JSON.parse(content);
    if (json.video_url) return json.video_url;
    if (json.url) return json.url;
    if (json.videoUrl) return json.videoUrl;
    if (json.data?.video_url) return json.data.video_url;
    if (json.result?.url) return json.result.url;
    if (json.video?.url) return json.video.url;
    if (json.content?.video_url) return json.content.video_url;
  } catch {
    // Not complete JSON, continue with other methods
  }

  // Try to extract JSON from code blocks (common in Gemini/Markdown responses)
  const jsonBlockRegex = /```(?:json)?\s*\{[\s\S]*?\}\s*```/gi;
  const jsonMatches = content.match(jsonBlockRegex);
  if (jsonMatches) {
    for (const jsonBlock of jsonMatches) {
      try {
        const cleaned = jsonBlock.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleaned);
        if (json.video_url) return json.video_url;
        if (json.url) return json.url;
        if (json.videoUrl) return json.videoUrl;
        if (json.data?.video_url) return json.data.video_url;
        if (json.result?.url) return json.result.url;
        if (json.video?.url) return json.video.url;
      } catch {
        // Continue to next JSON block
      }
    }
  }

  // Try to extract URLs from Markdown links: [text](url) or ![text](url)
  const markdownLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/gi;
  const markdownMatches = Array.from(content.matchAll(markdownLinkRegex));
  if (markdownMatches.length > 0) {
    for (const match of markdownMatches) {
      const url = match[2];
      if (/\.(mp4|mov|webm|m4v)/i.test(url) || url.includes('/video/') || url.includes('poecdn') || url.includes('hopp.io') || url.includes('storage.googleapis.com')) {
        console.log('[Video Parse] Found URL in Markdown link:', url);
        return url;
      }
    }
  }

  // Try to find a URL that looks like a video file or a hosted video page
  // Enhanced regex to include Gemini/Google Cloud Storage and other 2026 video hosting services
  const urlRegex = /(https?:\/\/[^\s"'<>\)]+(?:\.mp4|\.mov|\.webm|\.m4v|\/video\/|v\.|\/v\/|aws|blob|cdn|poecdn|hopp\.io|kling|runway|storage\.googleapis\.com|firebasestorage|gemini)[^\s"'<>\)]*)/gi;
  const matches = content.match(urlRegex);

    if (matches && matches.length > 0) {
    // Return the first match that isn't obviously a static image unless no other choice
    for (const url of matches) {
      // Clean up URL (remove trailing punctuation that might have been captured)
      const cleanUrl = url.replace(/[.,;!?\)]+$/, '');
      if (/\.(mp4|mov|webm|m4v)/i.test(cleanUrl) || 
          cleanUrl.includes('/video/') || 
          cleanUrl.includes('poecdn') || 
          cleanUrl.includes('hopp.io') ||
          cleanUrl.includes('storage.googleapis.com') ||
          cleanUrl.includes('firebasestorage')) {
        console.log('[Video Parse] Selected URL:', cleanUrl);
        return cleanUrl;
      }
    }
    // Fallback to first match if no better candidate found
    const cleanUrl = matches[0].replace(/[.,;!?\)]+$/, '');
    console.log('[Video Parse] Using fallback URL:', cleanUrl);
    return cleanUrl;
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
  const config = isInternal 
    ? (INTERNAL_API_CONFIG[settings.provider] || INTERNAL_API_CONFIG.gpt)
    : { baseUrl: settings.baseUrl, apiKey: settings.apiKey };
  const baseUrl = config.baseUrl;
  const apiKey = config.apiKey;

  console.log('[Video API] Resolved Config:', { baseUrl: config.baseUrl, provider: settings.provider });

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

  // Video model mapping: map friendly names to actual API model IDs
  // Video model mapping - maps display names to actual API model IDs
  // Updated based on official API documentation
  const videoModelMap: Record<string, Record<string, string>> = {
    doubao: {
      'doubao-seedance-1-5-pro-251215': 'doubao-seedance-1-5-pro-251215',
    },
    qwen: {
      'wan2.6-t2v': 'wan2.6-t2v',
      'wan2.5-t2v-preview': 'wan2.5-t2v-preview',
      'wan2.2-t2v-plus': 'wan2.2-t2v-plus',
    },
    gpt: {
      'sora-2': 'sora-2',
      'sora-2-pro': 'sora-2-pro',
    },
    grok: {
      // Grok doesn't have video models in the provided list, only image generation
      'grok-2-image-1212': 'grok-2-image-1212',
    },
    gemini: {
      'veo-3.1-generate-preview': 'veo-3.1-generate-preview',
      'veo-3.1-fast-generate-preview': 'veo-3.1-fast-generate-preview',
      'veo-3.0-generate-001': 'veo-3.0-generate-001',
      'veo-3.0-fast-generate-001': 'veo-3.0-fast-generate-001',
      // Note: Veo models require native API endpoint, not OpenAI-compatible format
    },
    perplexity: {
      // Perplexity doesn't have video models in the provided list
    },
  };

  try {
    console.log('[Video API] ========== VIDEO GENERATION REQUEST ==========');
    console.log('[Video API] Mode:', settings.apiMode);
    console.log('[Video API] Original video model:', videoConfig.model);

    // Map video model name to actual API ID
    let actualVideoModel = videoConfig.model;
    const providerVideoMap = videoModelMap[settings.provider] || {};
    if (providerVideoMap[videoConfig.model]) {
      actualVideoModel = providerVideoMap[videoConfig.model];
      console.log('[Video API] Mapped video model:', videoConfig.model, '->', actualVideoModel);
    } else {
      // Try lowercase version
      const lowerModel = videoConfig.model.toLowerCase();
      if (providerVideoMap[lowerModel]) {
        actualVideoModel = providerVideoMap[lowerModel];
        console.log('[Video API] Mapped video model (lowercase):', videoConfig.model, '->', actualVideoModel);
      } else {
        // Use as-is, but ensure lowercase for some providers
        if (settings.provider === 'gemini') {
          actualVideoModel = actualVideoModel.toLowerCase();
          // Remove 'models/' prefix if present
          if (actualVideoModel.startsWith('models/')) {
            actualVideoModel = actualVideoModel.replace('models/', '');
          }
        }
        console.log('[Video API] Using video model as-is:', actualVideoModel);
      }
    }

    // Protocol Switching: Check if this is Google Veo model (requires native API endpoint)
    // Veo models have names like 'veo-3.1-generate-preview', 'veo-3.0-generate-001', etc.
    const cleanKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : '';
    const isGeminiVeo = settings.provider === 'gemini' && (
      actualVideoModel.toLowerCase().includes('veo') ||
      actualVideoModel.toLowerCase().includes('generate')
    );
    const isGeminiDirect = settings.provider === 'gemini' && !useProxy;

    // Handle Google Veo native API endpoint (Protocol Branch)
    if (isGeminiVeo) {
      console.log('[Video Protocol] Detected Google Veo, switching to Native API...');
      
      // Clean and prepare model ID (remove 'models/' prefix if present)
      let veoModelId = actualVideoModel.toLowerCase();
      if (veoModelId.startsWith('models/')) {
        veoModelId = veoModelId.replace('models/', '');
      }
      // Ensure no duplicate 'models/' prefix
      veoModelId = veoModelId.replace(/^models\//, '');
      
      // Use native Google Veo API endpoint
      // Format: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateVideo?key={apiKey}
      const nativeApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${veoModelId}:generateVideo?key=${cleanKey}`;
      
      console.log('[Video API] Using native Veo endpoint:', nativeApiUrl);
      console.log('[Video Debug] Requesting Veo model:', veoModelId, 'at', nativeApiUrl);

      // Request Body Adaptation: Convert from OpenAI format to Google native format
      // Calculate aspect ratio from width and height
      let aspectRatio = '16:9'; // Default
      if (videoConfig.width && videoConfig.height) {
        const ratio = videoConfig.width / videoConfig.height;
        if (Math.abs(ratio - 16/9) < 0.1) {
          aspectRatio = '16:9';
        } else if (Math.abs(ratio - 9/16) < 0.1) {
          aspectRatio = '9:16';
        } else if (Math.abs(ratio - 4/3) < 0.1) {
          aspectRatio = '4:3';
        } else if (Math.abs(ratio - 1) < 0.1) {
          aspectRatio = '1:1';
        } else {
          // Use closest standard ratio or calculate
          aspectRatio = `${videoConfig.width}:${videoConfig.height}`;
        }
      }

      // Google Veo native API request body format
      const veoRequestBody: any = {
        prompt: prompt, // Use the prompt parameter directly from Step 1
        videoConfig: {
          aspectRatio: aspectRatio,
          durationSeconds: videoConfig.duration || 5, // Default to 5 seconds if not specified
        },
      };

      // Add optional reference image if available
      if (videoConfig.useImageReference && videoConfig.referenceImageUrl) {
        veoRequestBody.videoConfig.referenceImage = {
          url: videoConfig.referenceImageUrl,
        };
      }

      console.log('[Video API] Veo request body:', JSON.stringify(veoRequestBody, null, 2));

      try {
        // Use Chrome Extension background script to avoid CORS issues
        // Check if we're in a Chrome extension context and internal mode
        // More robust detection: check for chrome object and runtime API
        const hasChrome = typeof chrome !== 'undefined';
        const hasChromeRuntime = hasChrome && chrome.runtime && chrome.runtime.id;
        const hasSendMessage = hasChromeRuntime && typeof chrome.runtime.sendMessage === 'function';
        const isChromeExtension = Boolean(hasChrome && hasChromeRuntime && hasSendMessage);
        
        console.log('[Video API] Environment check:', {
          hasChrome,
          hasChromeRuntime,
          hasSendMessage,
          isChromeExtension,
          isInternal,
          provider: settings.provider,
          apiMode: settings.apiMode,
          chromeRuntimeId: hasChromeRuntime ? chrome.runtime.id : 'N/A',
          windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A',
        });
        
        // Force use background script for Veo in internal mode, even if detection fails
        // This is a workaround for development environments where chrome object might not be detected
        const shouldUseBackground = isInternal && (isChromeExtension || (hasChrome && chrome.runtime));
        
        let responseText: string;
        let responseStatus: number;
        let responseOk: boolean;

        if (shouldUseBackground) {
          console.log('[Video API] Using Chrome Extension background script (GENERATE_VIDEO_VEO) to avoid CORS');
          
          // Send request through background script using GENERATE_VIDEO_VEO message type
          const response = await new Promise<{
            success: boolean;
            status?: number;
            statusText?: string;
            body?: string;
            error?: string;
          }>((resolve, reject) => {
            try {
              chrome.runtime.sendMessage(
                {
                  type: 'GENERATE_VIDEO_VEO',
                  payload: {
                    apiUrl: nativeApiUrl,
                    requestBody: veoRequestBody,
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                } as ChromeMessage,
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('[Video API] Chrome runtime error:', chrome.runtime.lastError.message);
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                  }
                  resolve(response || { success: false, error: 'No response from background script' });
                }
              );
            } catch (err) {
              console.error('[Video API] Error sending message to background:', err);
              reject(err);
            }
          });

          console.log('[Video API] Background script response:', {
            success: response.success,
            status: response.status,
            hasBody: !!response.body,
            error: response.error,
          });

          if (!response.success) {
            const errorMsg = response.error || 'Background script request failed';
            console.error('[Video API] Background script failed:', errorMsg);
            throw new Error(errorMsg);
          }

          responseText = response.body || '';
          responseStatus = response.status || 0;
          responseOk = response.success && (response.status === undefined || (response.status >= 200 && response.status < 400));
          
          console.log('[Video API] Response parsed:', {
            status: responseStatus,
            ok: responseOk,
            bodyLength: responseText.length,
            bodyPreview: responseText.substring(0, 200),
          });
        } else {
          // Fallback to direct fetch (for testing or non-extension environments)
          console.warn('[Video API] Using direct fetch (fallback mode) - may encounter CORS issues');
          console.warn('[Video API] isChromeExtension:', isChromeExtension, 'isInternal:', isInternal);
          
          const response = await fetch(nativeApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(veoRequestBody),
            // Note: mode: 'no-cors' would prevent reading response, so we don't use it
          });

          responseText = await response.text();
          responseStatus = response.status;
          responseOk = response.ok;
          
          console.log('[Video API] Direct fetch response:', {
            status: responseStatus,
            ok: responseOk,
            bodyLength: responseText.length,
          });
        }
        
        if (!responseOk) {
          console.error('[Video API] Veo native API error:', responseStatus, responseText.substring(0, 200));
          
          // If 404 or other error, provide helpful message
          if (responseStatus === 404) {
    return { 
      result: { type: 'text', status: 'failed', content: prompt, prompt },
              error: 'Google Veo 模型目前需通过原生 API 或公司专用中转调用，不支持 OpenAI 兼容格式。请检查后端代理是否已支持 Veo 原生接口。'
            };
          }
          
          return {
            result: { type: 'text', status: 'failed', content: prompt, prompt },
            error: `Veo API Error: ${responseStatus} - ${responseText.substring(0, 100)}`
          };
        }

        // Parse Veo native API response
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          return {
            result: { type: 'text', status: 'failed', content: prompt, prompt },
            error: 'Invalid response from Veo API'
          };
        }

        console.log('[Video API] Veo response:', JSON.stringify(data, null, 2));

        // Async Task ID Handling: Google native API returns an operation object
        // The operation.name is the task ID for polling
        const operationName = data.name || data.operation?.name || data.taskId;
        
        if (operationName) {
          console.log('[Video API] Veo operation created, taskId:', operationName);
          // Return pending status with taskId for polling
          return {
            result: {
              type: 'pending',
              status: 'processing',
              content: JSON.stringify(data),
              taskId: operationName,
              prompt: prompt,
              progress: 0, // Initial progress
            }
          };
        }

        // If operation is already done (synchronous response), check for video URL
        const videoUrl = data.videoUrl || data.url || data.video?.url || data.result?.videoUrl || data.response?.videoUrl;
        
        if (videoUrl) {
          console.log('[Video API] SUCCESS - Veo video URL found (synchronous):', videoUrl);
          return {
            result: {
              type: 'video',
              status: 'completed',
              content: JSON.stringify(data),
              videoUrl: videoUrl,
              duration: videoConfig.duration,
              prompt: prompt,
              progress: 100,
            }
          };
        }

        // No video URL or operation name found
        console.warn('[Video API] Veo response does not contain video URL or operation name');
        return {
          result: { type: 'text', status: 'failed', content: prompt, prompt },
          error: 'Veo API response does not contain video URL or operation name'
        };
      } catch (err) {
        console.error('[Video API] Veo native API exception:', err);
        return {
          result: { type: 'text', status: 'failed', content: prompt, prompt },
          error: `Veo API Exception: ${err instanceof Error ? err.message : String(err)}`
        };
      }
    }

    // Standard OpenAI-compatible endpoint for non-Veo models
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

    let requestBody: any = {
      model: actualVideoModel,
      messages: messages,
      temperature: 0.7,
    };

    // Gemini-specific adjustments (for non-Veo models)
    if (settings.provider === 'gemini' && !isGeminiVeo) {
      // Ensure model name is lowercase
      requestBody.model = requestBody.model.toLowerCase();
      // Remove 'models/' prefix if present
      if (requestBody.model.startsWith('models/')) {
        requestBody.model = requestBody.model.replace('models/', '');
      }
    }

    let apiUrl = `${baseUrl}/chat/completions`;

    // Add key parameter for Gemini in development mode
    if (isGeminiDirect && cleanKey) {
      apiUrl += `?key=${cleanKey}`;
    }

    console.log('[Video API] Calling API:', apiUrl);
    console.log('[Video Debug] Requesting model:', requestBody.model, 'at', apiUrl);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (cleanKey) {
      headers['Authorization'] = `Bearer ${cleanKey}`;
      if (settings.provider === 'gemini') {
        headers['x-goog-api-key'] = cleanKey;
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    const responseText = await response.text();
    if (!response.ok) {
      // Special handling for Gemini Veo models that might fall through
      if (settings.provider === 'gemini' && actualVideoModel.toLowerCase().includes('veo')) {
        return {
          result: { type: 'text', status: 'failed', content: prompt, prompt },
          error: 'Google Veo 模型目前需通过原生 API 或公司专用中转调用，不支持 OpenAI 兼容格式。请检查后端代理是否已支持 Veo 原生接口。'
        };
      }
      
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
