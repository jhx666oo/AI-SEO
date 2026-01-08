# 方案三实施指南：混合 API Key 管理

## 📋 已完成的工作

### 1. 环境变量配置
- ✅ 创建了 `.env.example` 模板文件
- ✅ `.gitignore` 已包含 `.env` 保护规则

### 2. 前端代码重构
- ✅ 更新了 `src/services/ai.ts`，支持环境自动切换
- ✅ 开发环境：直连各供应商（使用 `.env` 中的 Key）
- ✅ 生产环境：统一走代理服务（Key 存储在服务器端）

### 3. 后端代理服务
- ✅ 创建了 `server/proxy.js` 代理服务模板
- ✅ 支持 6 个供应商的请求转发
- ✅ 包含身份验证和审计日志功能

---

## 🚀 下一步操作指南

### 阶段一：本地开发环境配置（立即执行）

#### 步骤 1：创建本地环境变量文件

```bash
# 在项目根目录执行
cp .env.example .env
```

#### 步骤 2：填入您的 API Key

打开 `.env` 文件，将占位符替换为真实的 API Key：

```bash
# 豆包 (字节跳动)
VITE_DOUBAO_API_KEY=您的豆包Key

# 通义千问 (阿里云)
VITE_QWEN_API_KEY=您的千问Key

# ChatGPT (OpenAI)
VITE_OPENAI_API_KEY=您的OpenAI Key

# Grok (xAI)
VITE_GROK_API_KEY=您的Grok Key

# Gemini (Google)
VITE_GEMINI_API_KEY=您的Gemini Key

# Perplexity AI
VITE_PERPLEXITY_API_KEY=您的Perplexity Key
```

#### 步骤 3：重启开发服务器

```bash
# 停止当前的 npm run dev（Ctrl+C）
# 重新启动
npm run dev
```

#### 步骤 4：测试各供应商

1. 打开 http://localhost:5173
2. 进入设置 → 确保选择 **Internal Mode**
3. 依次选择每个供应商（Doubao、Qwen、ChatGPT、Grok、Gemini、Perplexity）
4. 点击 Generate 测试是否能正常生成内容

---

### 阶段二：生产环境部署（1-2 周后）

#### 选项 A：使用 Vercel Serverless Functions（推荐）

**优势**：零运维成本，自动扩展，免费额度充足

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **创建 Vercel 配置文件**
   
   在项目根目录创建 `vercel.json`：
   ```json
   {
     "functions": {
       "server/proxy.js": {
         "memory": 512,
         "maxDuration": 30
       }
     },
     "routes": [
       {
         "src": "/v1/ai-proxy/(.*)",
         "dest": "/server/proxy.js"
       }
     ]
   }
   ```

3. **部署代理服务**
   ```bash
   cd server
   vercel
   ```

4. **配置环境变量**
   - 登录 Vercel Dashboard
   - 进入项目设置 → Environment Variables
   - 添加 6 个供应商的 API Key（不带 `VITE_` 前缀）

5. **更新前端配置**
   
   在 Vercel 前端项目的环境变量中添加：
   ```
   VITE_PROXY_BASE_URL=https://your-proxy.vercel.app/v1/ai-proxy
   ```

#### 选项 B：使用 Cloudflare Workers

**优势**：全球边缘节点，极低延迟

1. **安装 Wrangler CLI**
   ```bash
   npm i -g wrangler
   ```

2. **创建 Worker**
   ```bash
   wrangler init ai-proxy
   ```

3. **将 `server/proxy.js` 改写为 Worker 格式**（需要调整语法）

4. **部署**
   ```bash
   wrangler publish
   ```

#### 选项 C：自建 Node.js 服务器

**优势**：完全控制，适合企业内网

1. **安装依赖**
   ```bash
   cd server
   npm init -y
   npm install express cors node-fetch
   ```

2. **启动服务**
   ```bash
   node proxy.js
   ```

3. **使用 PM2 守护进程**
   ```bash
   npm i -g pm2
   pm2 start proxy.js --name ai-proxy
   pm2 save
   ```

---

## ⚠️ 重要安全提醒

### 1. 保护 .env 文件

**检查 .gitignore**：
```bash
git status
# 确保 .env 不在待提交列表中
```

**如果不小心提交了**：
```bash
# 从 Git 历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
```

### 2. 定期轮换 API Key

建议每 3 个月轮换一次所有供应商的 API Key。

### 3. 监控额度使用

在各供应商的控制台设置额度告警，防止超支。

---

## 🔍 故障排查

### 问题 1：开发环境报错 "API Key not configured"

**原因**：`.env` 文件未正确加载

**解决方案**：
1. 确认 `.env` 文件在项目根目录
2. 确认变量名以 `VITE_` 开头
3. 重启开发服务器

### 问题 2：生产环境报错 "Unknown provider"

**原因**：代理服务未正确部署或环境变量未配置

**解决方案**：
1. 检查代理服务是否正常运行
2. 确认服务器端环境变量已配置（不带 `VITE_` 前缀）
3. 查看代理服务日志

### 问题 3：Gemini 仍然报 400 错误

**原因**：模型 ID 格式问题

**解决方案**：
1. 确保选择 `gemini-1.5-flash` 或 `gemini-1.5-pro`
2. 检查代码中的模型 ID 前缀逻辑是否正确

---

## 📊 当前架构总结

```
开发环境 (npm run dev)
├── 前端读取 .env 中的 VITE_* 变量
├── 直连各 AI 供应商
└── 适合快速调试

生产环境 (npm run build)
├── 前端请求发送到代理服务
├── 代理服务从服务器环境变量读取真实 Key
├── 代理服务转发到各 AI 供应商
└── 绝对安全，Key 不暴露
```

---

## ✅ 验收标准

- [ ] 本地开发环境能成功调用所有 6 个供应商
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 生产环境代理服务已部署（如需要）
- [ ] 生产环境前端能通过代理成功调用 AI

---

**如有任何问题，请随时联系开发团队！**
