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
  wordpressApiUrl?: string;
  wordpressApiKey?: string;
  wordpressUsername?: string;
  wordpressPassword?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'Doubao-pro-128k',
  apiMode: 'internal',
  provider: 'doubao',
  companyName: '',
  brandName: '',
  wordpressApiUrl: '',
  wordpressApiKey: '',
  wordpressUsername: '',
  wordpressPassword: '',
};

// AI Config for request
export interface AIConfig {
  systemPrompt: string;
  outputLanguage: string;
  outputFormat: string;
  enableWebSearch: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
}

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
  | 'veo-3.1-generate-preview'
  | 'veo-3.1-fast-generate-preview'
  | 'veo-3.0-generate-001'
  | 'veo-3.0-fast-generate-001'
  | 'doubao-seedance-1-5-pro-251215'
  | 'wan2.6-t2v'
  | 'wan2.5-t2v-preview'
  | 'wan2.2-t2v-plus'
  // Legacy models (for backward compatibility)
  | 'Sora'
  | 'Sora-Pro'
  | 'Veo-2'
  | 'Veo-3'
  | 'Runway-Gen3'
  | 'Kling-Video'
  | 'Kling-1.5'
  | 'Hailuo-Video'
  | 'Pika-Video'
  | 'Luma-Dream-Machine'
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
    provider: 'OpenAI',
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
    provider: 'OpenAI',
  },
  // Google Veo
  {
    name: 'veo-3.1-generate-preview',
    displayName: 'Google Veo 3.1',
    maxDuration: 10,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'Google Veo 3.1 - latest preview version with audio support',
    provider: 'Google',
  },
  {
    name: 'veo-3.1-fast-generate-preview',
    displayName: 'Google Veo 3.1 Fast',
    maxDuration: 8,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Google Veo 3.1 Fast - faster generation for quick previews',
    provider: 'Google',
  },
  {
    name: 'veo-3.0-generate-001',
    displayName: 'Google Veo 3.0',
    maxDuration: 10,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: true,
    description: 'Google Veo 3.0 stable version',
    provider: 'Google',
  },
  {
    name: 'veo-3.0-fast-generate-001',
    displayName: 'Google Veo 3.0 Fast',
    maxDuration: 8,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Google Veo 3.0 Fast - faster generation',
    provider: 'Google',
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
    provider: 'Doubao',
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
    provider: 'Qwen',
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
    provider: 'Qwen',
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
    provider: 'Qwen',
  },
  // Runway
  {
    name: 'Runway-Gen3',
    displayName: 'Runway Gen-3 Alpha',
    maxDuration: 10,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 768,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Runway Gen-3 Alpha video model',
    provider: 'Runway',
  },
  // Kuaishou Kling
  {
    name: 'Kling-Video',
    displayName: 'Kling Video',
    maxDuration: 10,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Kuaishou Kling video model',
    provider: 'Kuaishou',
  },
  {
    name: 'Kling-1.5',
    displayName: 'Kling 1.5',
    maxDuration: 10,
    minDuration: 5,
    durationStep: 1,
    defaultWidth: 1920,
    defaultHeight: 1080,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Kuaishou Kling 1.5 enhanced model',
    provider: 'Kuaishou',
  },
  // MiniMax Hailuo
  {
    name: 'Hailuo-Video',
    displayName: 'Hailuo Video',
    maxDuration: 6,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1280,
    defaultHeight: 720,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'MiniMax Hailuo video model',
    provider: 'MiniMax',
  },
  // Pika Labs
  {
    name: 'Pika-Video',
    displayName: 'Pika Video',
    maxDuration: 4,
    minDuration: 3,
    durationStep: 1,
    defaultWidth: 1024,
    defaultHeight: 576,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Pika Labs video generation',
    provider: 'Pika',
  },
  // Luma AI
  {
    name: 'Luma-Dream-Machine',
    displayName: 'Luma Dream Machine',
    maxDuration: 5,
    minDuration: 4,
    durationStep: 1,
    defaultWidth: 1360,
    defaultHeight: 752,
    supportsImageReference: true,
    supportsSoundGeneration: false,
    description: 'Luma AI Dream Machine',
    provider: 'Luma',
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
  model: 'sora-2',
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
    // Legacy model names (for reference only - not recommended for production):
    'doubao-seed-1-8-251228',     // 深度思考 (deprecated: use Endpoint ID instead)
    'doubao-seed-1-6-lite-251015', // 深度思考 (deprecated: use Endpoint ID instead)
    'doubao-seed-1-6-flash-250828', // 深度思考 (deprecated: use Endpoint ID instead)
  ],
  qwen: [
    'qwen-max',                   // 通义千问 (official ID, qwen3-max maps to this)
    'qwen-max-latest',            // 通义千问
    'qwen-max-0125',              // 通义千问
    'qwen-flash',                 // 通义千问
  ],
  gpt: [
    'gpt-5.2',                    // OpenAI GPT-5.2
    'gpt-5.1',                    // OpenAI GPT-5.1
    'gpt-5',                      // OpenAI GPT-5
    'gpt-5-mini',                 // OpenAI GPT-5 Mini
    'GPT-4o',                     // OpenAI GPT-4o
    'GPT-o3',                     // OpenAI O3
    'GPT-4o-mini',                // OpenAI GPT-4o Mini
  ],
  grok: [
    'grok-4-1-fast-reasoning',    // Grok 文本、图像生文
    'grok-code-fast-1',           // Grok 代码生成
  ],
  gemini: [
    'gemini-3-pro-preview',       // Google Gemini 3 Pro
    'gemini-3-flash-preview',     // Google Gemini 3 Flash
    'gemini-2.5-flash',           // Google Gemini 2.5 Flash
    'gemini-2.5-flash-lite',      // Google Gemini 2.5 Flash Lite
    'gemini-2.5-pro',             // Google Gemini 2.5 Pro
    'gemini-2.0-flash',           // Google Gemini 2.0 Flash
  ],
  perplexity: [
    'sonar',                      // Perplexity Sonar (official format: lowercase)
    'sonar-pro',                  // Perplexity Sonar Pro (official format: lowercase with hyphen)
    'sonar-reasoning-pro',        // Perplexity Sonar Reasoning Pro (official format: lowercase with hyphens)
    'sonar-deep-research',        // Perplexity Sonar Deep Research (official format: lowercase with hyphens)
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