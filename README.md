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
- **视频生成** - 支持多种领先视频生成模型：
  - **OpenAI**: Sora-2, Sora-2-Pro
  - **Google Veo**: Veo-3.1, Veo-3.0 系列
  - **通义千问**: Wan 2.6 T2V, Wan 2.5 T2V Preview, Wan 2.2 T2V Plus
  - **豆包**: Doubao Seedance 1.5 Pro
- **模型测试功能** - 一键测试所有配置的模型，验证 API Key 和连接性
- **智能错误处理** - 友好的错误提示，自动检测 API Key 失效、模型名称错误等问题
- **内容审计 (Audit Trail)** - 自动记录品牌数据和商业活动，支持后端分析
- **自定义提示词** - 可基于公司品牌信息自定义系统提示词和生成参数

### ⚙️ 内容配置
- **输出语言** - 支持 12+ 种语言（中文、English、日本語、Русский 等）
- **输出格式** - Markdown、HTML、JSON、纯文本
- **推理强度** - 低/中/高三种级别
- **网络搜索** - 可启用 AI 网络搜索功能

### 🔗 WordPress 集成
- **自动同步** - 将生成的内容自动同步到 WordPress/WooCommerce
- **API 配置** - 支持 REST API 和 Basic Auth
- **产品更新** - 批量更新产品内容

### 📊 会话管理
- **多会话支持** - 管理多个工作会话
- **媒体库** - 管理和组织图片资源
- **配置保存** - 自动保存 AI 配置和视频配置

### 🎬 视频生成
- **多种模型** - Sora-2、Sora-2-Pro、Veo-3.1、Veo-3.0 系列、Wan 2.6 T2V、Doubao Seedance 1.5 Pro 等
- **自定义参数** - 时长、分辨率、宽高比、品牌信息等
- **图片参考** - 支持使用参考图片生成视频
- **音频支持** - 部分模型（如 Veo-3.1、Sora-2-Pro）支持音频生成
- **CORS 绕过** - 通过 Chrome Extension Background Script 自动处理跨域问题

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS
- **状态管理**: React Hooks
- **存储方案**: LocalStorage（Web 环境）
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

## 🚀 部署

### 方式一：静态网站部署（推荐）

本项目构建为静态网站，可以部署到任何静态网站托管服务。

#### Vercel 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署**
   ```bash
   vercel
   ```

   或直接在 [Vercel](https://vercel.com) 网站导入 GitHub 仓库，自动部署。

#### Netlify 部署

1. **安装 Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **构建并部署**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

   或直接在 [Netlify](https://netlify.com) 网站导入 GitHub 仓库。

#### GitHub Pages 部署

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **在 package.json 中添加部署脚本**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

#### 其他静态托管服务

- **Cloudflare Pages**: 导入 GitHub 仓库，构建命令 `npm run build`，输出目录 `dist`
- **AWS S3 + CloudFront**: 将 `dist` 目录上传到 S3，配置 CloudFront 分发
- **Azure Static Web Apps**: 导入 GitHub 仓库自动部署
- **阿里云 OSS**: 将 `dist` 目录上传到 OSS，配置静态网站托管

### 方式二：服务器部署

#### 使用 Nginx

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置 Nginx**
   
   创建或编辑 `/etc/nginx/sites-available/ai-seo`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/ai-seo/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **启用配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/ai-seo /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **复制文件**
   ```bash
   sudo cp -r dist /var/www/ai-seo/
   sudo chown -R www-data:www-data /var/www/ai-seo
   ```

#### 使用 Apache

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置 Apache**
   
   创建或编辑 `/etc/apache2/sites-available/ai-seo.conf`:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/ai-seo/dist

       <Directory /var/www/ai-seo/dist>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       # 重写规则（支持前端路由）
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </VirtualHost>
   ```

3. **启用配置**
   ```bash
   sudo a2ensite ai-seo.conf
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

4. **复制文件**
   ```bash
   sudo cp -r dist /var/www/ai-seo/
   sudo chown -R www-data:www-data /var/www/ai-seo
   ```

#### 使用 Docker

1. **创建 Dockerfile**
   ```dockerfile
   # 构建阶段
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # 运行阶段
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **创建 nginx.conf**
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **构建和运行**
   ```bash
   docker build -t ai-seo .
   docker run -d -p 80:80 ai-seo
   ```

### 环境变量配置

#### Internal Mode 环境变量

在 Internal Mode 下，需要通过环境变量配置各供应商的 API Key：

**开发环境**（`.env` 文件）：
```bash
VITE_DOUBAO_API_KEY=your_doubao_api_key
VITE_QWEN_API_KEY=your_qwen_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GROK_API_KEY=your_grok_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
```

**生产环境**（推荐使用代理服务）：
```bash
# 如果使用代理服务（推荐）
VITE_PROXY_BASE_URL=https://api.yourcompany.com/v1/ai-proxy
VITE_INTERNAL_SESSION_TOKEN=your_session_token

# 如果未配置代理（会回退到直连，有跨域风险）
# 系统会自动使用各供应商的官方 API 地址
```

**架构说明**：
- **开发环境**：直连各供应商官方 API（使用环境变量中的 API Key）
- **生产环境**：
  - 如果配置了 `VITE_PROXY_BASE_URL`，统一走代理服务（安全，推荐）
  - 如果未配置 `VITE_PROXY_BASE_URL`，回退到各供应商官方地址（紧急测试用，有跨域风险）

详细配置方法请参考 [API Key 管理文档](./docs/INTERNAL_MODE_API_KEY_MANAGEMENT.md)

### 跨域配置（CORS）

如果部署到自定义域名，需要确保：

1. **XOOBAY API**: 联系技术团队在 XOOBAY API 服务器配置 CORS，允许您的域名访问
2. **WordPress API**: 在 WordPress 中安装 CORS 插件或配置服务器允许跨域请求

如果遇到跨域错误，系统会显示友好的错误提示。

## 📖 使用指南

### 首次使用

1. **配置 API Key**
   - 点击右上角 ⚙️ 设置图标
   - 选择 **API 模式**：
     - **Internal Mode（推荐）**：通过环境变量配置6个供应商的 API Key（详见[配置说明](#-配置说明)）
     - **DIY Mode（自定义）**：手动配置 Base URL 和 API Key
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
   - 在首页浏览 XOOBAY 产品列表
   - 使用搜索框筛选产品
   - 选择语言（中文、English 等）
   - 点击产品或使用"Load Selected Product"按钮

2. **编辑内容**
   - 查看提取的产品信息
   - 编辑文本内容（如需要）
   - 选择要包含的图片

3. **配置生成参数**
   - 选择输出语言
   - 选择输出格式（Markdown、HTML 等）
   - 调整推理强度
   - 启用/禁用网络搜索
   - 预览系统提示词

4. **生成内容**
   - 点击"Generate"按钮
   - 等待 AI 生成内容
   - 查看生成结果（Rendered 或 Raw 视图）
   - 复制或下载内容

5. **同步到 WordPress（可选）**
   - 点击"Sync to WordPress"按钮
   - 内容将自动同步到 WordPress/WooCommerce

### 视频生成

1. **切换到视频模式**
   - 在配置页面选择"Video"标签
   - 选择视频模型（Sora、Veo-3 等）
   - 配置视频参数：
     - 时长（秒）
     - 分辨率（宽 x 高）
     - 品牌名称和 URL
     - 目标语言
     - 视频风格
     - 音频支持（如模型支持）
     - 参考图片（如模型支持）

2. **生成视频**
   - 点击"Generate Video"按钮
   - 等待视频生成（可能需要较长时间）
   - 查看生成的视频

### 会话管理

- **创建会话**: 点击会话图标，创建新会话
- **切换会话**: 在会话列表中选择不同的会话
- **重命名会话**: 点击会话名称进行编辑
- **删除会话**: 点击删除按钮（需确认）

### 媒体库

- **查看媒体**: 点击媒体库图标查看所有图片
- **重命名媒体**: 点击媒体项名称进行编辑
- **删除媒体**: 点击删除按钮移除不需要的媒体

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

#### DIY Mode (手动配置)

- **模式**: DIY Mode (Custom)
- **需要手动配置**: Base URL 和 API Key
- **默认配置**:
  - Base URL: `https://api.openai.com/v1` (OpenAI)
  - 默认模型: `gpt-5.2`
- **适用场景**: 使用自定义 API 服务或代理

### 模型测试

项目内置模型测试功能，可在设置面板中一键测试所有配置的模型：

1. 打开设置面板（点击右上角 ⚙️ 图标）
2. 切换到 **Internal Mode**
3. 在底部找到 "🧪 Model Testing" 部分
4. 点击 "🚀 Test All Models" 按钮
5. 查看测试结果（✓ 成功 / ✗ 错误）

测试功能会自动：
- 遍历所有提供商的模型
- 发送简单的测试请求
- 显示每个模型的连接状态
- 提供友好的错误提示

### 模型名称规范

系统会自动处理模型名称的大小写和格式：

- **OpenAI**: 自动转换为小写（GPT-4o → gpt-4o）
- **Perplexity**: 自动转换为小写加连字符（Sonar Pro → sonar-pro）
- **Gemini**: 自动转换为小写格式，支持多种输入格式（Gemini-3-Pro-Preview → gemini-3-pro-preview）
- **豆包**: 使用 Endpoint ID (ep-xxx)，不进行转换
- **通义千问**: qwen3-max 自动映射为 qwen-max

### 特殊模型注意事项

- **推理模型 (o1, o3)**: temperature 固定为 1，不支持自定义
- **GPT-5 系列**: temperature 固定为 1
- **豆包**: Model 字段应填写 Endpoint ID，而非模型名称

#### XOOBAY API

- **API URL**: 由 XOOBAY 平台提供
- **语言支持**: zh_cn（简体中文）、en（English）、zh_tw（繁體中文）、ru（Русский）
- **注意**: 需要配置 CORS 权限或部署在公司域名下

#### WordPress REST API

- **API URL**: `https://your-site.com/wp-json/wc/v3`（WooCommerce）
- **认证方式**: 
  - API Key（推荐）
  - 用户名 + 密码（Basic Auth）
- **权限要求**: 需要编辑产品的权限

### 支持的 AI 模型

#### 文本生成模型 (2025 官方模型列表)

- **OpenAI**: 
  - GPT-5.2, GPT-5.1, GPT-5, GPT-5-mini
  - GPT-4o, GPT-4o-mini
  - o3, o3-mini (推理模型，temperature 固定为 1)
  - o1, o1-preview, o1-mini (推理模型，temperature 固定为 1)
- **Google Gemini**: 
  - Gemini-3-Pro-Preview, Gemini-3-Flash-Preview
  - Gemini-2.5-Pro, Gemini-2.5-Flash, Gemini-2.5-Flash-Lite
  - Gemini-2.0-Flash
- **Grok (xAI)**: 
  - grok-4-1-fast-reasoning (文本、图像生文)
  - grok-code-fast-1 (代码生成)
  - grok-2-image-1212 (生图)
- **通义千问 (Qwen)**: 
  - qwen-max (注意：qwen3-max 会自动映射为 qwen-max)
  - qwen-max-latest, qwen-max-0125
  - qwen-flash
- **豆包 (Doubao)**: 
  - doubao-seed-1-8-251228 (深度思考)
  - doubao-seed-1-6-lite-251015 (深度思考)
  - doubao-seed-1-6-flash-250828 (深度思考)
  - ⚠️ **注意**: Doubao Model 字段应填写 Endpoint ID (ep-xxx)，而非模型名称
- **Perplexity**: 
  - sonar (搜索模型)
  - sonar-pro (搜索模型)
  - sonar-reasoning-pro (搜索模型)
  - sonar-deep-research (搜索模型)

#### 视频生成模型 (官方列表)

本项目支持以下 6 个供应商的视频生成模型：

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

> **注意**: 
> - 所有模型名称已更新为官方 API ID，支持自动大小写转换和格式规范化
> - Grok 和 Perplexity 目前不提供视频生成模型
> - 视频模型列表已更新，仅包含当前支持的 6 个供应商的模型

## 📁 项目结构

```
.
├── public/                 # 静态资源
│   └── icons/             # 图标文件
├── docs/                   # 文档目录
│   ├── INTERNAL_MODE_API_KEY_MANAGEMENT.md  # API Key 管理文档
│   └── DEPLOYMENT_CHECKLIST.md              # 上线前检查清单
├── src/
│   ├── background/        # Chrome Extension Background Script
│   │   └── index.ts       # 处理视频生成请求（绕过 CORS）
│   ├── content/           # Content Script（保留）
│   ├── hooks/             # React Hooks
│   │   ├── useAI.ts       # AI 请求逻辑
│   │   ├── useSession.ts  # 会话管理
│   │   ├── useSettings.ts # 设置管理
│   │   └── useXoobay.ts   # XOOBAY API 集成
│   ├── services/          # API 服务
│   │   ├── ai.ts          # AI API 调用（包含模型名称规范化）
│   │   ├── wordpress.ts   # WordPress API 调用
│   │   └── xoobay.ts      # XOOBAY API 调用
│   ├── sidepanel/         # 主应用界面
│   │   ├── App.tsx        # 主组件（包含模型测试功能）
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

## 🔧 开发

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动，支持热更新。

### 构建

```bash
npm run build
```

构建产物输出到 `dist` 目录。

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npx tsc --noEmit
```

## 📝 注意事项

1. **API Key 安全**: 
   - ⚠️ **重要**: 不要将 `.env` 文件提交到 Git
   - API Key 存储在浏览器 LocalStorage 中，请确保部署在 HTTPS 环境下
   - 使用 Internal Mode 时，API Key 通过环境变量管理，更安全
   - 详细配置方法请参考 [API Key 管理文档](./docs/INTERNAL_MODE_API_KEY_MANAGEMENT.md)

2. **模型配置**:
   - 豆包 (Doubao) 需要填写 Endpoint ID (ep-xxx)，而非模型名称
   - OpenAI 模型名称会自动转换为小写格式
   - Perplexity 模型名称会自动转换为小写加连字符格式
   - 推理模型 (o1, o3) 和 GPT-5 系列自动设置 temperature = 1

3. **跨域问题**: 
   - XOOBAY API 需要配置 CORS，建议部署在公司域名下
   - Google Veo 视频生成通过 Chrome Extension Background Script 自动处理跨域
   - 如遇到跨域错误，系统会显示友好的错误提示

4. **错误处理**:
   - 系统会自动检测 API Key 失效 (403 错误)
   - 自动检测模型名称拼写错误 (404 错误)
   - 提供友好的中文错误提示

5. **WordPress 权限**: 确保 WordPress API 用户有足够的权限编辑产品

6. **视频生成时间**: 视频生成可能需要较长时间，请耐心等待

7. **浏览器兼容性**: 建议使用现代浏览器（Chrome、Firefox、Edge、Safari 最新版）

8. **Chrome Extension**: 本项目同时支持作为 Chrome Extension 和 Web 应用使用

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
