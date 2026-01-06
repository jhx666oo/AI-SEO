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
- **文本生成** - 使用 AI 生成 SEO/GEO 优化的产品博客文章
- **视频生成** - 支持多种视频生成模型（Sora、Veo、Runway、Kling 等）
- **多模型支持** - 支持 GPT-5、Claude、Gemini、DeepSeek、Grok 等多种 AI 模型
- **自定义提示词** - 可自定义系统提示词和生成参数

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
- **多种模型** - Sora、Sora Pro、Veo-2、Veo-3、Runway Gen-3、Kling Video 等
- **自定义参数** - 时长、分辨率、宽高比、品牌信息等
- **图片参考** - 支持使用参考图片生成视频
- **音频支持** - 部分模型支持音频生成

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS
- **状态管理**: React Hooks
- **存储方案**: LocalStorage（Web 环境）
- **API 集成**: 
  - POE API（AI 模型）
  - XOOBAY API（产品信息）
  - WordPress REST API（内容同步）

## 📦 安装

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 从源码安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/jhx666oo/AI-SEO.git
   cd AI-SEO
   ```

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

### 环境变量配置（可选）

如需在生产环境配置默认值，可以在部署时设置环境变量：

- `VITE_DEFAULT_API_URL`: 默认 API Base URL
- `VITE_DEFAULT_MODEL`: 默认 AI 模型

**注意**: 本项目主要使用浏览器 LocalStorage 存储配置，环境变量仅用于设置默认值。

### 跨域配置（CORS）

如果部署到自定义域名，需要确保：

1. **XOOBAY API**: 联系技术团队在 XOOBAY API 服务器配置 CORS，允许您的域名访问
2. **WordPress API**: 在 WordPress 中安装 CORS 插件或配置服务器允许跨域请求

如果遇到跨域错误，系统会显示友好的错误提示。

## 📖 使用指南

### 首次使用

1. **配置 API Key**
   - 点击右上角 ⚙️ 设置图标
   - 输入 POE API Key（或其他支持的 API Key）
   - 设置 Base URL（默认: `https://api.poe.com/v1`）
   - 选择默认 AI 模型

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

#### POE API

- **Base URL**: `https://api.poe.com/v1`（默认）
- **API Key**: 从 [Poe Creator Platform](https://creator.poe.com) 获取
- **支持模型**: GPT-5、Claude、Gemini、DeepSeek、Grok 等 50+ 模型

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

#### 文本生成模型

- **OpenAI**: GPT-5.1, GPT-5, GPT-5-mini, o3
- **Anthropic**: Claude-Opus-4.5, Claude-4.5-Sonnet, Claude-3.7-Sonnet
- **Google**: Gemini-3-Pro-Preview, Gemini-2.5-Pro, Gemini-2.5-Flash
- **xAI**: Grok-4, Grok-4.1-Fast, Grok-4-Fast
- **DeepSeek**: DeepSeek-V3.2, DeepSeek-V3.1-Terminus, DeepSeek-R1
- **其他**: Kimi-K2-Thinking, Qwen3-235B, MiniMax-M2, Nova-2.0-Pro-Preview

#### 视频生成模型

- **OpenAI**: Sora, Sora Pro
- **Google**: Veo-2, Veo-3
- **Runway**: Runway Gen-3 Alpha
- **Kuaishou**: Kling Video, Kling 1.5
- **MiniMax**: Hailuo Video
- **Pika**: Pika Video
- **Luma**: Luma Dream Machine

## 📁 项目结构

```
.
├── public/                 # 静态资源
│   └── icons/             # 图标文件
├── src/
│   ├── background/        # Background Script（保留，用于未来扩展）
│   ├── content/           # Content Script（保留，用于未来扩展）
│   ├── hooks/             # React Hooks
│   │   ├── useAI.ts       # AI 请求逻辑
│   │   ├── useSession.ts  # 会话管理
│   │   ├── useSettings.ts # 设置管理
│   │   └── useXoobay.ts   # XOOBAY API 集成
│   ├── services/          # API 服务
│   │   ├── ai.ts          # AI API 调用
│   │   ├── wordpress.ts   # WordPress API 调用
│   │   └── xoobay.ts      # XOOBAY API 调用
│   ├── sidepanel/         # 主应用界面
│   │   ├── App.tsx        # 主组件
│   │   └── main.tsx       # 入口文件
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 所有类型定义
│   ├── utils/             # 工具函数
│   │   ├── storage.ts     # 本地存储工具
│   │   └── templates.ts   # 提示词模板
│   └── index.css          # 全局样式
├── index.html             # HTML 入口
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── tailwind.config.js     # Tailwind CSS 配置
```

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

1. **API Key 安全**: API Key 存储在浏览器 LocalStorage 中，请确保部署在 HTTPS 环境下
2. **跨域问题**: XOOBAY API 需要配置 CORS，建议部署在公司域名下
3. **WordPress 权限**: 确保 WordPress API 用户有足够的权限编辑产品
4. **视频生成时间**: 视频生成可能需要较长时间，请耐心等待
5. **浏览器兼容性**: 建议使用现代浏览器（Chrome、Firefox、Edge、Safari 最新版）

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
