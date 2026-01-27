// Settings Types
// POE uses unified API for all models including video
// Reference: https://creator.poe.com/docs/poe-api-overview
export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
  apiMode: 'internal' | 'custom';
  provider: 'gpt' | 'gemini' | 'grok' | 'doubao' | 'qwen' | 'perplexity';
  companyName: string;
  brandName: string;
  theme: 'light' | 'dark';
  isEnterprise: boolean;
  usageLimit: number;
  usageCount: number;
  wordpressApiUrl?: string;
  wordpressApiKey?: string;
  wordpressUsername?: string;
  wordpressPassword?: string;
  // New fields for AI Config
  systemPrompt: string;
  outputLanguage: string;
  outputFormat: string;
  enableWebSearch: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
  // New fields for Video Config
  videoModel: VideoModel;
  videoDuration: number;
  videoWidth: number;
  videoHeight: number;
  // Daily Usage Tracking
  dailyUsage: DailyUsage;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  normalText: number;
  proText: number;
  video: number;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://litellm.xooer.com/v1',  // LiteLLM Gateway
  model: 'gpt-5.2',  // 使用 LiteLLM 服务器上可用的最新模型
  apiMode: 'internal',  // 使用生产模式
  provider: 'gpt',  // 统一为 gpt (OpenAI 兼容接口)
  companyName: '',
  brandName: '',
  theme: 'light',
  isEnterprise: false,
  usageLimit: 100,
  usageCount: 0,
  wordpressApiUrl: '',
  wordpressApiKey: '',
  wordpressUsername: '',
  wordpressPassword: '',
  // Default AI Config values
  systemPrompt: '',
  outputLanguage: 'auto',
  outputFormat: 'markdown',
  enableWebSearch: false,
  reasoningEffort: 'medium',
  // Default Video Config values
  videoModel: 'gemini/veo-3.1-generate-preview',
  videoDuration: 5,
  videoWidth: 1280,
  videoHeight: 720,
  dailyUsage: {
    date: new Date().toISOString().split('T')[0],
    normalText: 0,
    proText: 0,
    video: 0,
  },
};

// AI Config for request
export interface AIConfig {
  systemPrompt: string;
  outputLanguage: string;
  outputFormat: string;
  enableWebSearch: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
}

// Available models on LiteLLM server
export const LITELLM_MODELS = [
  { value: 'gpt-5.2', label: 'GPT-5.2 (Latest)', provider: 'OpenAI' },
  { value: 'gpt-4', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { value: 'vertex_ai/claude-sonnet-4-5', label: 'Claude 4.5 (Vertex)', provider: 'Anthropic' },
  { value: 'xai/grok-4-1-fast-reasoning-latest', label: 'Grok 4.1 Reasoning', provider: 'xAI' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', provider: 'Google' },
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  systemPrompt: '',
  outputLanguage: 'auto',
  outputFormat: 'markdown',
  enableWebSearch: false,
  reasoningEffort: 'medium',
};

// Video Generation Types
// POE uses unified chat/completions API for all models
// Video models are accessed like any other model through the same API
// Use "List available models" endpoint to find available video models
// Reference: https://creator.poe.com/docs/poe-api-overview
export type VideoModel =
  // Official Video Models
  | 'sora-2'
  | 'sora-2-pro'
  | 'gemini/veo-3.1-generate-preview'
  | 'gemini/veo-3.1-fast-generate-preview'
  | 'gemini/veo-3.0-generate-001'
  | 'gemini/veo-3.0-fast-generate-001'
  | 'gemini/veo-2.0-generate-001'
  | 'doubao-seedance-1-5-pro-251215'
  | 'wan2.6-t2v'
  | 'wan2.5-t2v-preview'
  | 'wan2.2-t2v-plus'
  // Legacy models (for backward compatibility)
  | 'Sora'
  | 'Sora-Pro'
  | 'Veo-2'
  | 'Veo-3'
  // Custom video model (user can create their own)
  | string;

export interface VideoModelConfig {
  name: VideoModel;
  displayName: string;
  maxDuration: number;
  minDuration: number;
  durationStep: number;
  defaultWidth: number;
  defaultHeight: number;
  supportsImageReference: boolean;
  supportsSoundGeneration: boolean;
  description: string;
  provider: string;
}

// Official Video Models - Updated based on official API documentation
export const VIDEO_MODELS: VideoModelConfig[] = [
  // OpenAI Sora
  {
    name: 'sora-2',
    displayName: 'Sora 2',
    maxDuration: 20,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'OpenAI Sora 2 video generation model',
    provider: 'gpt',
  },
  {
    name: 'sora-2-pro',
    displayName: 'Sora 2 Pro',
    maxDuration: 60,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'OpenAI Sora 2 Pro - enhanced quality and longer videos',
    provider: 'gpt',
  },
  // Google Veo
  {
    name: 'gemini/veo-3.1-generate-preview',
    displayName: 'Google Veo 3.1',
    maxDuration: 10,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'Google Veo 3.1 - latest preview version with audio support',
    provider: 'gemini',
  },
  {
    name: 'gemini/veo-3.1-fast-generate-preview',
    displayName: 'Google Veo 3.1 Fast',
    maxDuration: 8,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Google Veo 3.1 Fast - faster generation for quick previews',
    provider: 'gemini',
  },
  {
    name: 'gemini/veo-3.0-generate-001',
    displayName: 'Google Veo 3.0',
    maxDuration: 10,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'Google Veo 3.0 stable version',
    provider: 'gemini',
  },
  {
    name: 'gemini/veo-3.0-fast-generate-001',
    displayName: 'Google Veo 3.0 Fast',
    maxDuration: 8,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Google Veo 3.0 Fast - faster generation',
    provider: 'gemini',
  },
  {
    name: 'gemini/veo-2.0-generate-001',
    displayName: 'Google Veo 2.0',
    maxDuration: 10,
    minDuration: 3,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Google Veo 2.0 - stable video generation model',
    provider: 'gemini',
  },
  // Doubao Video
  {
    name: 'doubao-seedance-1-5-pro-251215',
    displayName: 'Doubao Seedance 1.5 Pro',
    maxDuration: 15,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'Doubao Seedance 1.5 Pro video generation',
    provider: 'doubao',
  },
  // Qwen Video
  {
    name: 'wan2.6-t2v',
    displayName: 'Wan 2.6 T2V',
    maxDuration: 10,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Qwen Wan 2.6 Text-to-Video',
    provider: 'qwen',
  },
  {
    name: 'wan2.5-t2v-preview',
    displayName: 'Wan 2.5 T2V Preview',
    maxDuration: 10,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Qwen Wan 2.5 Text-to-Video Preview',
    provider: 'qwen',
  },
  {
    name: 'wan2.2-t2v-plus',
    displayName: 'Wan 2.2 T2V Plus',
    maxDuration: 10,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Qwen Wan 2.2 Text-to-Video Plus',
    provider: 'qwen',
  },
];

export interface VideoConfig {
  model: VideoModel;
  duration: number;
  width: number;
  height: number;
  useImageReference: boolean;
  referenceImageUrl: string;
  enableSound: boolean;
  brandName: string;
  brandUrl: string;
  targetLanguage: 'zh-CN' | 'en' | 'ja' | 'ko';
  videoStyle: 'product-demo' | 'lifestyle' | 'cinematic' | 'minimal';
  systemPrompt: string;
}

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  model: 'gemini/veo-3.1-generate-preview',
  duration: 5,
  width: 1920,
  height: 1080,
  useImageReference: false,
  referenceImageUrl: '',
  enableSound: false,
  brandName: 'XOOBAY',
  brandUrl: 'https://www.xoobay.com/',
  targetLanguage: 'zh-CN',
  videoStyle: 'product-demo',
  systemPrompt: '',
};

// Available Models - Official 2025 Models grouped by provider
// Updated based on official API documentation
export const PROVIDER_MODELS: Record<string, string[]> = {
  doubao: [
    'doubao-pro-4k',
  ],
  qwen: [
    'qwen-turbo',
  ],
  gpt: [
    'gpt-5.2',
    'gpt-4',
    'gpt-3.5-turbo',
  ],
  anthropic: [
    'claude-3-sonnet',
    'vertex_ai/claude-sonnet-4-5',
  ],
  grok: [
    'xai/grok-4-1-fast-reasoning-latest',
  ],
  gemini: [
    'gemini-2.5-flash-lite',
  ],
  perplexity: [
    'sonar',
  ],
};

// Flat list for compatibility
export const AVAILABLE_MODELS = Object.values(PROVIDER_MODELS).flat();

// Page Content Types
export interface PageContent {
  url: string;
  title: string;
  text: string;
  html: string;
  selectedText: string | null;
  images: ImageInfo[];
  links: LinkInfo[];
  metadata: PageMetadata;
}

export interface ImageInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LinkInfo {
  href: string;
  text: string;
}

export interface PageMetadata {
  description: string | null;
  keywords: string | null;
  author: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}

// Format Template
export interface FormatTemplate {
  type: 'json' | 'xml' | 'custom';
  content: string;
}

// Message Types
export type MessageType =
  | 'GET_PAGE_CONTENT'
  | 'GET_SELECTED_TEXT'
  | 'GET_SETTINGS'
  | 'SAVE_SETTINGS'
  | 'AI_REQUEST'
  | 'VIDEO_REQUEST'
  | 'GENERATE_VIDEO_VEO';

export interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}

// Video Generation Result
// POE returns video URL in message.content (synchronous)
export interface VideoGenerationResult {
  type: 'video' | 'text' | 'pending';
  status: 'pending' | 'queued' | 'in_progress' | 'processing' | 'completed' | 'failed' | 'cancelled';
  content: string;        // For text: the text content; For video: the raw response
  videoUrl?: string;      // Direct video URL if available
  thumbnailUrl?: string;  // Video thumbnail if available
  duration?: number;      // Video duration in seconds
  prompt?: string;        // The generated prompt that was used
  taskId?: string;        // Task ID (if applicable)
  progress?: number;      // Progress percentage (0-100)
  error?: string;         // Error message if failed
}

// ============================================
// Session & Media Library Types
// ============================================

// Media item types in the library
export type MediaType = 'video' | 'text' | 'image';

// Individual media item in the library
export interface MediaItem {
  id: string;
  type: MediaType;
  createdAt: number;
  name: string;              // User-friendly name
  prompt?: string;           // The prompt used to generate this item
  content: string;           // For text: the content; For video/image: the URL
  videoUrl?: string;         // Video URL if type is 'video'
  thumbnailUrl?: string;     // Thumbnail URL for preview
  metadata: {
    model: string;           // Model used to generate
    duration?: number;       // Video duration in seconds
    width?: number;          // Video/image width
    height?: number;         // Video/image height
    style?: string;          // Video style
    language?: string;       // Target language
  };
}

// Session represents a workspace with its own page content and media library
export interface Session {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  pageUrl?: string;          // Source page URL
  pageTitle?: string;        // Source page title
  pageContent?: PageContent; // Captured page content
  aiConfig: AIConfig;        // AI configuration for this session
  videoConfig: VideoConfig;  // Video configuration for this session
  mediaLibrary: MediaItem[]; // Generated media items
}

// Default session factory
export function createDefaultSession(name?: string): Session {
  const now = Date.now();
  return {
    id: `session_${now}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || `Session ${new Date(now).toLocaleDateString()}`,
    createdAt: now,
    updatedAt: now,
    aiConfig: { ...DEFAULT_AI_CONFIG },
    videoConfig: { ...DEFAULT_VIDEO_CONFIG },
    mediaLibrary: [],
  };
}

// Session storage state
export interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;
}

// ============================================
// XOOBAY API Types
// ============================================
export type XoobayLanguage = 'zh_cn' | 'en' | 'zh_hk' | 'ru';