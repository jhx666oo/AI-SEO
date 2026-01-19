# AI SEO Web 部署指南 (Web Deployment Guide)

本手册介绍如何将 AI SEO 应用部署到您自己的域名和服务器上。

## 1. 准备工作

在开始部署之前，确保您已经：
- [ ] 拥有一个已指向服务器的域名（如 `aiseo.yourdomain.com`）。
- [ ] 已在服务器上安装了 Node.js 环境（仅构建时需要）。
- [ ] 已获取 LiteLLM Gateway 的 API Key 和 Base URL。

## 2. 生产环境构建 (Build)

在部署到域名之前，您需要将代码编译为静态文件：

1. **进入项目目录**:
   ```bash
   cd AI-SEO
   ```

2. **配置生产环境变量**:
   修改或创建 `.env` 文件，确保包含以下内容：
   ```bash
   VITE_LITELLM_API_KEY=您的生产环境密钥
   VITE_LITELLM_BASE_URL=https://litellm.xooer.com/v1
   ```

3. **执行构建命令**:
   ```bash
   npm run build
   ```
   构建完成后，项目根目录下会生成一个 `dist` 文件夹，这就是我们需要上传到服务器的内容。

## 3. 部署方案 (Deployment Options)

### 方案 A: 使用 宝塔面板/Nginx (推荐)

如果您使用的是传统的 Linux 服务器或宝塔面板：

1. **上传文件**: 将 `dist` 文件夹下的所有文件上传到网站根目录。
2. **Nginx 配置**:
   ```nginx
   server {
       listen 80;
       server_name aiseo.yourdomain.com;
       root /www/wwwroot/aiseo_project/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # 建议开启 SSL (HTTPS) 以确保 API 调用安全
   }
   ```

### 方案 B: 使用 Vercel / Netlify (最快速)

如果您希望零配置部署：
1. 将代码提交到 GitHub 仓库。
2. 在 Vercel 后台点击 **"New Project"**。
3. 选择该仓库。
4. 在 **Environment Variables** 中添加 `VITE_LITELLM_API_KEY`。
5. 点击 **"Deploy"**。

## 4. API 安全注意事项

> [!WARNING]
> **重要安全性提示**:
> 由于本应用是前端应用，`VITE_` 开头的环境变量在构建 (`npm run build`) 时会被硬编码进 JavaScript 文件中。
> 
> - **内部使用**: 如果该域名仅限内部员工使用，直接部署即可。
> - **公开使用**: 如果您计划向公众开放，强烈建议通过 Nginx 或反向代理服务器转发请求，以隐藏真实的 API Key。

## 5. 验证部署

1. **访问域名**: 确保页面加载正常，Logo 和标题显示正确。
2. **测试登录/设置**: 
   - 打开设置面板，确认模式为 **"企业托管"**。
   - 点击 **"立即扫描"**，确认 ChatGPT/Gemini 显示为 **"可用"**。

---
*文档版本: v2.0.0 | 最后更新: 2026-01-19*
