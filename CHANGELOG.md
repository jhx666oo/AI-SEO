# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-16

### 🎨 UI/UX Enhancements

#### Layout Improvements
- **Expanded Workspace** - Increased main container width from `max-w-4xl` to `max-w-7xl` for more spacious layout
- **Optimized Heights** - Enhanced content area heights:
  - Main card container: 1000px minimum height
  - Product list: 700px maximum height
  - Content editing area: 700px minimum height
  - Result display area: 700px minimum height
- **Two-Column Product Grid** - Converted product list from single column to 2-column grid layout for better space utilization

#### Typography & Spacing
- **Larger Titles** - Increased main titles from `text-2xl` to `text-3xl`
- **Enhanced Body Text** - Upgraded body text from `text-sm` to `text-base`
- **Bigger Input Fields** - Increased input/select padding from `py-5` to `py-6` and font size to `text-base`
- **Improved Buttons** - Enhanced button padding and sizes for better clickability
- **Spacious Textarea** - Increased padding from `p-8` to `p-10` with `leading-loose` line-height

#### Header Enhancements
- **Taller Header** - Increased height from `h-16` to `h-20`
- **Larger Logo** - Expanded logo from `w-10 h-10` to `w-14 h-14` with bigger icon (`w-8 h-8`)
- **Enhanced Title** - Upgraded main title from `text-sm` to `text-lg`
- **Bigger Controls** - Enlarged quota display, language switcher, settings button, and account icon

### 🎬 Video Generation Feature Restoration

#### Core Features
- **Dual-Mode Interface** - Added text/video mode switcher in Step 3
- **Video Configuration UI** - Complete video generation settings:
  - Video model selector (Sora 2, Sora 2 Pro, Doubao Seedance, Qwen Wan series)
  - Video style selection (Product Demo, Lifestyle, Cinematic, Minimal) with visual cards
  - Target language selection with flag icons (中文, English, 日本語, 한국어)
  - Advanced parameters (duration, resolution, brand info)

#### Video Result Display
- **Circular Progress Indicator** - Real-time progress percentage display during generation
- **Video Player** - Built-in video player with controls for completed videos
- **Download Functionality** - One-click video download button
- **Prompt Display** - Show and copy generated video prompts
- **Error Handling** - Comprehensive error messages with retry functionality

#### Technical Integration
- **Generation Logic** - Integrated `sendVideoRequest` with proper `buildVideoSystemPrompt` configuration
- **Polling System** - Real-time video generation status polling
- **LLM Lite Ready** - Architecture prepared for LLM Lite API integration to bypass CORS restrictions

### 🐛 Bug Fixes

#### Critical Fixes
- **AI Output Language Selection** - Fixed bug where AI output language was incorrectly following UI language instead of user-selected target language
  - Changed `buildSystemPrompt` parameter from `lang` (UI language) to `aiConfig.outputLanguage`
  - Now the 12-language selection in Step 3 actually works as intended
  - Users can use Chinese UI to generate English content, or English UI to generate Japanese content

### 📚 Documentation

#### New Documentation
- **LLM Lite Integration Guide** - Comprehensive guide for integrating LLM Lite middleware server
  - Current architecture analysis
  - Integration approach (no code changes needed!)
  - API interface specifications
  - Configuration steps
  - Testing and troubleshooting

#### Updated Documentation
- **README.md** - Completely updated to reflect:
  - All UI enhancements
  - Video generation features
  - Language selection capabilities
  - LLM Lite integration preparation
- **Documentation Cleanup Plan** - Organized project documentation structure

### 🔧 Technical Improvements

- **Code Quality** - Removed unused imports and variables
- **Build Verification** - All changes verified with successful builds
- **Type Safety** - Fixed TypeScript type errors in video generation logic

---

## [1.0.0] - 2025-12-09

### 🎉 Initial Release

#### Features
- **Page Content Extraction**
  - Full page text extraction with smart filtering
  - Image detection with alt text and dimensions
  - Automatic removal of navigation, headers, footers, scripts

- **AI Integration**
  - Support for multiple AI models (GPT-5, Claude, Gemini, DeepSeek, Grok, etc.)
  - Customizable system prompt with template support
  - Pre-built SEO/GEO product blog template

- **Configuration Options**
  - Output language selection (12 languages)
  - Output format (Markdown, HTML, JSON, Plain Text)
  - Reasoning effort levels (Low/Medium/High)
  - Web search toggle

- **Result Rendering**
  - Enhanced Markdown renderer (headers, lists, code blocks, links, etc.)
  - HTML renderer with sanitization
  - JSON renderer with syntax highlighting
  - Plain text renderer with heading detection

- **User Interface**
  - Modern dark theme UI
  - 4-step workflow (Read → Edit → Config → Result)
  - Side panel interface
  - Image selection with thumbnails
  - Copy and download functionality

#### Technical
- Built with React 18 + TypeScript
- Vite + CRXJS build system
- Tailwind CSS styling
- Chrome Manifest V3
