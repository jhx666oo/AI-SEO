# AI SEO - AI-Powered Product Content Generator

<p align="center">
  <strong>智能产品内容生成工具，基于 AI 生成 SEO 优化的产品博客文章和视频内容</strong>
</p>

<p align="center">
  <a href="#features">功能特性</a> •
  <a href="#tech-stack">技术栈</a> •
  <a href="#installation">安装</a> •
  <a href="#deployment">部署</a> •
  <a href="#usage">使用指南</a> •
  <a href="#configuration">配置</a>
</p>

---

## ✨ 功能特性

### 🛍️ 产品管理
- **XOOBAY 产品集成** - 从 XOOBAY API 获取产品列表和信息
- **多语言支持** - 支持中文、English、繁體中文、Русский 等语言
- **产品搜索** - 快速搜索和筛选产品
- **产品详情提取** - 自动提取产品名称、描述、规格等信息
- **两栏产品布局** - 优化的产品列表展示，提升浏览效率

### 🤖 AI 内容生成
- **双态化配置 (Dual-Mode)** - 支持 **Internal Mode (内网 Agent)** 和 **DIY Mode (手动配置)**
- **2025 旗舰模型支持** - 全面适配最新模型：
  - **OpenAI**: GPT-5.2, GPT-5.1, GPT-5, GPT-5-mini, GPT-4o, GPT-o3, GPT-4o-mini
  - **Google Gemini**: Gemini-3-Pro-Preview, Gemini-3-Flash-Preview, Gemini-2.5-Pro, Gemini-2.5-Flash
  - **Grok**: grok-4-1-fast-reasoning, grok-code-fast-1
  - **通义千问**: qwen-max, qwen-max-latest, qwen-max-0125, qwen-flash
  - **豆包**: doubao-seed-1-8-251228, doubao-seed-1-6-lite-251015, doubao-seed-1-6-flash-250828
  - **Perplexity**: sonar, sonar-pro, sonar-reasoning-pro, sonar-deep-research
- **文本生成** - 使用 AI 生成 SEO/GEO 优化的产品博客文章
  - **12种输出语言** - 支持 Auto、English、简体中文、繁體中文、日本語、한국어、Español、Français、Deutsch、Português、Русский、العربية
  - **独立语言选择** - UI 语言和 AI 输出语言独立配置，灵活满足多语言需求
- **视频生成** 🎬 - 支持多种领先视频生成模型：
  - **OpenAI**: Sora-2, Sora-2-Pro
  - **Google Veo**: Veo-3.1, Veo-3.0 系列
  - **通义千问**: Wan 2.6 T2V, Wan 2.5 T2V Preview, Wan 2.2 T2V Plus
  - **豆包**: Doubao Seedance 1.5 Pro
  - **双模式界面** - 文本/视频生成模式一键切换
  - **丰富配置选项** - 视频模型、风格、时长、分辨率等全面可配置
  - **实时进度显示** - 圆形进度条显示视频生成进度
  - **视频播放预览** - 内置视频播放器，支持下载
- **模型测试功能** - 一键测试所有配置的模型，验证 API Key 和连接性
- **智能错误处理** - 友好的错误提示，自动检测 API Key 失效、模型名称错误等问题
- **内容审计 (Audit Trail)** - 自动记录品牌数据和商业活动，支持后端分析
- **自定义提示词** - 可基于公司品牌信息自定义系统提示词和生成参数

### ⚙️ 内容配置
- **输出语言** - 支持 12+ 种语言（中文、English、日本語、한국어、Español、Français、Deutsch、Português、Русский、العربية 等）
- **输出格式** - Markdown、HTML、JSON、纯文本
- **推理强度** - 低/中/高三种级别
- **网络搜索** - 可启用 AI 网络搜索功能

### 🎨 现代化 UI/UX
- **SaaS White 设计风格** - 简洁优雅的白色主题，专业企业级外观
- **大气布局** - 扩展的工作区域（max-w-7xl），提供充足的创作空间
- **优化的高度** - 主容器 1000px，内容区域 700px，减少滚动提升效率
- **增强的排版** - 更大的标题（text-3xl）、正文（text-base）和按钮，提升可读性
- **精致的 Header** - 更大的 Logo、标题和控件，专业感十足
- **响应式设计** - 完美适配各种屏幕尺寸

### 🔗 WordPress 集成
- **自动同步** - 将生成的内容自动同步到 WordPress/WooCommerce
- **API 配置** - 支持 REST API 和 Basic Auth
- **产品更新** - 批量更新产品内容

### 📊 会话管理
- **多会话支持** - 管理多个工作会话
- **媒体库** - 管理和组织图片资源
- **配置保存** - 自动保存 AI 配置和视频配置

### 🌐 LLM Lite 集成准备
- **架构就绪** - 已为 LLM Lite 中转 API 对接做好准备
- **灵活配置** - 支持自定义 Base URL 和 API Key
- **CORS 解决方案** - 通过中转服务器绕过浏览器跨域限制
- **详细文档** - 提供完整的 LLM Lite 对接指南

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS
- **状态管理**: React Hooks
- **存储方案**: Chrome Storage API / LocalStorage
- **API 集成**: 
  - 6个AI模型供应商（OpenAI, Google Gemini, Grok/xAI, 通义千问, 豆包, Perplexity）
  - XOOBAY API（产品信息）
  - WordPress REST API（内容同步）

## 📦 安装

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 从源码安装

1. **克隆仓库**
   
   如果您还没有项目代码，请克隆仓库：
   ```bash
   git clone https://github.com/jhx666oo/AI-SEO.git
   cd AI-SEO
   ```

   > **注意**: 
   > - 克隆后会自动创建 `AI-SEO` 目录（与 GitHub 仓库名相同）
   > - 如果您本地已经有项目代码（无论目录名是什么），可以直接进入项目根目录，跳过克隆步骤
   > - 项目根目录应包含 `package.json`、`src/`、`index.html` 等文件

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **开发模式运行**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

   应用将在 `http://localhost:5173` 启动

4. **构建生产版本**
   ```bash
   npm run build
   # 或
   yarn build
   ```

   构建产物将输出到 `dist` 目录

5. **预览生产版本**
   ```bash
   npm run preview
   # 或
   yarn preview
   ```

## 📖 使用指南

### 首次使用

1. **配置 API Key**
   - 点击右上角 ⚙️ 设置图标
   - 选择 **API 模式**：
     - **Internal Mode（推荐）**：通过环境变量配置6个供应商的 API Key（详见[配置说明](#-配置说明)）
     - **DIY Mode（自定义）**：手动配置 Base URL 和 API Key（支持 LLM Lite）
   - **DIY Mode 默认配置**：
     - Base URL: `https://api.openai.com/v1`
     - 默认模型: `gpt-5.2`
   - 选择默认 AI 模型（支持6个供应商的模型）

2. **配置 WordPress（可选）**
   - 在设置中输入 WordPress API URL
   - 配置 API Key 或用户名/密码
   - 测试连接

### 生成产品内容

1. **选择产品**
   - 在首页浏览 XOOBAY 产品列表（两栏布局）
   - 使用搜索框筛选产品
   - 选择语言（中文、English 等）
   - 点击产品或使用"Load Selected Product"按钮

2. **编辑内容**
   - 查看提取的产品信息
   - 编辑文本内容（如需要）
   - 选择要包含的图片

3. **配置生成参数**
   - **选择生成模式**：文本生成 或 视频生成
   
   **文本生成模式**：
   - 选择输出语言（12种语言可选）
   - 选择输出格式（Markdown、HTML 等）
   - 调整推理强度
   - 启用/禁用网络搜索
   
   **视频生成模式** 🎬：
   - 选择视频模型（Sora 2, Veo-3.1, Wan 2.6 等）
   - 选择视频风格（Product Demo, Lifestyle, Cinematic, Minimal）
   - 选择目标语言（中文、English、日本語、한국어）
   - 配置视频参数（时长、分辨率等）

4. **生成内容**
   - 点击"下一步"按钮
   - 等待 AI 生成内容
   - **文本模式**：查看生成结果，复制或下载内容
   - **视频模式**：观看进度条，完成后预览和下载视频

5. **同步到 WordPress（可选）**
   - 点击"Sync to WordPress"按钮
   - 内容将自动同步到 WordPress/WooCommerce

## ⚙️ 配置说明

### API 配置

#### Internal Mode (推荐)

- **模式**: Internal Mode
- **API Key 管理**: 通过环境变量 `.env` 文件配置（不提交到 Git）
- **支持提供商**: 
  - OpenAI (gpt)
  - Google Gemini (gemini)
  - Grok/xAI (grok)
  - 通义千问 (qwen)
  - 豆包 (doubao)
  - Perplexity (perplexity)
- **优势**: API Key 安全，集中管理，自动路由
- **配置方法**: 详见 [API Key 管理文档](./docs/INTERNAL_MODE_API_KEY_MANAGEMENT.md)

#### DIY Mode (手动配置 / LLM Lite)

- **模式**: DIY Mode (Custom)
- **需要手动配置**: Base URL 和 API Key
- **默认配置**:
  - Base URL: `https://api.openai.com/v1` (OpenAI)
  - 默认模型: `gpt-5.2`
- **适用场景**: 
  - 使用自定义 API 服务或代理
  - **对接 LLM Lite 中转服务器**（推荐用于视频生成）
- **LLM Lite 配置示例**:
  - Base URL: `https://your-llm-lite-server.com/v1`
  - API Key: `your-llm-lite-api-key`
- **详细文档**: 参见 [LLM Lite 对接指南](./docs/LLM_LITE_INTEGRATION.md)

### 语言配置

#### UI 界面语言
- **支持语言**: 中文 (zh) 和 English (en)
- **切换方式**: 点击右上角语言切换按钮
- **作用范围**: 仅影响界面显示文字（按钮、标签等）

#### AI 输出语言
- **支持语言**: 12种语言
  - Auto (自动)、English、简体中文、繁體中文
  - 日本語、한국어、Español、Français
  - Deutsch、Português、Русский、العربية
- **配置位置**: 步骤 3 "目标语言" 选择器
- **作用范围**: 决定 AI 生成内容的语言
- **灵活性**: 可以使用中文界面生成英文内容，或使用英文界面生成日文内容

### 视频生成配置

#### 支持的视频模型

- **OpenAI (GPT)**: 
  - sora-2 (支持图片参考，最大 20 秒)
  - sora-2-pro (支持图片参考和音频，最大 60 秒)
- **Google Gemini**: 
  - veo-3.1-generate-preview (支持音频，1920x1080)
  - veo-3.1-fast-generate-preview (快速预览，1280x720)
  - veo-3.0-generate-001 (稳定版，支持音频)
  - veo-3.0-fast-generate-001 (快速版本)
- **通义千问 (Qwen)**: 
  - wan2.6-t2v (Text-to-Video)
  - wan2.5-t2v-preview (预览版)
  - wan2.2-t2v-plus (增强版)
- **豆包 (Doubao)**: 
  - doubao-seedance-1-5-pro-251215 (支持音频，1920x1080，最大 15 秒)

#### 视频风格选项

- **Product Demo** - 产品展示风格
- **Lifestyle** - 生活方式风格
- **Cinematic** - 电影级风格
- **Minimal** - 极简风格

#### 重要提示

> **视频生成建议使用 LLM Lite**：
> - 视频模型的原生 API 通常禁止浏览器直接调用（CORS 限制）
> - 使用 LLM Lite 中转服务器可以绕过 CORS 限制
> - 提供更好的安全性和配额管理
> - 详见 [LLM Lite 对接指南](./docs/LLM_LITE_INTEGRATION.md)

## 📁 项目结构

```
.
├── public/                 # 静态资源
│   └── icons/             # 图标文件
├── docs/                   # 文档目录
│   ├── INTERNAL_MODE_API_KEY_MANAGEMENT.md  # API Key 管理文档
│   ├── DEPLOYMENT_CHECKLIST.md              # 上线前检查清单
│   └── LLM_LITE_INTEGRATION.md              # LLM Lite 对接指南
├── src/
│   ├── hooks/             # React Hooks
│   │   ├── useAI.ts       # AI 请求逻辑（文本+视频）
│   │   ├── useSession.ts  # 会话管理
│   │   ├── useSettings.ts # 设置管理
│   │   └── useXoobay.ts   # XOOBAY API 集成
│   ├── services/          # API 服务
│   │   ├── ai.ts          # AI API 调用（包含模型名称规范化）
│   │   ├── wordpress.ts   # WordPress API 调用
│   │   └── xoobay.ts      # XOOBAY API 调用
│   ├── sidepanel/         # 主应用界面
│   │   ├── App.tsx        # 主组件（包含文本/视频双模式）
│   │   └── main.tsx       # 入口文件
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 所有类型定义（包含最新模型列表）
│   ├── utils/             # 工具函数
│   │   ├── storage.ts     # 本地存储工具
│   │   └── templates.ts   # 提示词模板
│   └── index.css          # 全局样式
├── .gitignore             # Git 忽略文件（确保 .env 不被提交）
├── index.html             # HTML 入口
├── manifest.json          # Chrome Extension 清单文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── tailwind.config.js     # Tailwind CSS 配置
```

> **重要**: `.env` 文件包含敏感信息，已被 `.gitignore` 排除，不会被提交到 Git。

## 📝 注意事项

1. **API Key 安全**: 
   - ⚠️ **重要**: 不要将 `.env` 文件提交到 Git
   - API Key 存储在浏览器 Chrome Storage 中，请确保部署在 HTTPS 环境下
   - 使用 Internal Mode 时，API Key 通过环境变量管理，更安全
   - 详细配置方法请参考 [API Key 管理文档](./docs/INTERNAL_MODE_API_KEY_MANAGEMENT.md)

2. **语言配置**:
   - UI 语言（中文/英文）和 AI 输出语言（12种）是独立的
   - 可以使用中文界面生成任何语言的内容
   - 在步骤 3 选择正确的"目标语言"以生成期望语言的内容

3. **视频生成**:
   - 视频生成可能需要较长时间，请耐心等待
   - 建议使用 LLM Lite 中转服务器以避免 CORS 问题
   - 不同模型支持不同的参数和功能（音频、图片参考等）

4. **模型配置**:
   - 豆包 (Doubao) 需要填写 Endpoint ID (ep-xxx)，而非模型名称
   - OpenAI 模型名称会自动转换为小写格式
   - Perplexity 模型名称会自动转换为小写加连字符格式
   - 推理模型 (o1, o3) 和 GPT-5 系列自动设置 temperature = 1

5. **跨域问题**: 
   - XOOBAY API 需要配置 CORS，建议部署在公司域名下
   - 视频生成建议通过 LLM Lite 中转服务器处理
   - 如遇到跨域错误，系统会显示友好的错误提示

6. **浏览器兼容性**: 建议使用现代浏览器（Chrome、Firefox、Edge、Safari 最新版）

## 🆕 最新更新 (v1.1.0)

### UI/UX 增强
- ✅ 扩展布局宽度至 max-w-7xl，提供更大的工作空间
- ✅ 优化布局高度（主容器 1000px，内容区 700px）
- ✅ 增强排版（更大的标题、正文和按钮）
- ✅ 改进 Header 设计（更大的 Logo 和控件）
- ✅ 产品列表改为两栏布局

### 功能增强
- ✅ 完整恢复视频生成功能
- ✅ 文本/视频双模式切换界面
- ✅ 视频配置 UI（模型、风格、语言选择）
- ✅ 视频结果显示（进度条、播放器、下载）
- ✅ 修复 AI 输出语言选择 bug
- ✅ LLM Lite 对接架构准备

### 文档更新
- ✅ 新增 LLM Lite 对接指南
- ✅ 更新 README 反映最新功能
- ✅ 完善视频生成说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📮 支持

如有问题或建议，请 [提交 Issue](https://github.com/jhx666oo/AI-SEO/issues)

---

<p align="center">
  Made with ❤️ for content creators and marketers
</p>
