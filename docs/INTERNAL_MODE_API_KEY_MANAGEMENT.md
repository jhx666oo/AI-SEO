# Internal Mode API Key 管理方案

> **文档目的**：为 AI-SEO 项目的 Internal Mode 提供企业级 API Key 安全管理方案，确保多供应商密钥不会暴露到 GitHub 公共仓库中。

---

## 📌 问题背景

当前项目支持 6 个 AI 供应商（Doubao、Qwen、ChatGPT、Grok、Gemini、Perplexity），每个供应商都需要独立的 API Key。如果直接将这些 Key 硬编码在 `src/services/ai.ts` 中：

- ❌ **安全风险**：一旦提交到 GitHub，Key 会永久存在于 Git 历史中，即使后续删除也可能被恶意用户提取。
- ❌ **合规问题**：违反企业安全规范，可能导致额度被盗用、数据泄露等严重后果。
- ❌ **维护困难**：密钥轮换时需要修改代码并重新部署。

---

## 🎯 设计目标

1. **绝对安全**：API Key 不得出现在任何提交到 GitHub 的代码中。
2. **开发友好**：本地开发时能够快速配置和调试。
3. **生产可靠**：生产环境支持集中管理、权限控制和审计日志。
4. **易于扩展**：未来新增供应商时，无需大幅改动架构。

---

## 🏗️ 方案一：后端代理服务（推荐用于生产环境）

### 架构图

```
┌─────────────────┐
│  用户浏览器      │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP Request (无真实 Key)
         │ POST /v1/ai-proxy/chat/completions
         │ Body: { provider, model, messages }
         ↓
┌─────────────────────────────────┐
│  公司内网 API Gateway            │
│  (Backend Proxy Service)        │
│  ┌───────────────────────────┐  │
│  │ 1. 验证员工身份 (Token)   │  │
│  │ 2. 从密钥管理服务获取 Key │  │
│  │ 3. 转发到目标 AI 供应商   │  │
│  │ 4. 记录审计日志           │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │ 携带真实 API Key
         ↓
┌─────────────────────────────────┐
│  AI 供应商 API                  │
│  (OpenAI / Google / Anthropic)  │
└─────────────────────────────────┘
```

### 实施步骤

#### 1. 前端配置（`src/services/ai.ts`）

```typescript
// 所有 Internal Mode 请求统一走公司网关
const INTERNAL_API_CONFIG: Record<string, { baseUrl: string; apiKey: string }> = {
  default: {
    baseUrl: 'https://api.yourcompany.com/v1/ai-proxy',
    apiKey: 'internal-session-token', // 仅用于验证员工身份，非真实 AI Key
  },
};

// 发送请求时，在 body 中携带 provider 信息
const requestBody = {
  provider: settings.provider, // 'gemini', 'gpt', 'anthropic' 等
  model: settings.model,
  messages: messages,
  temperature: 0.7,
};
```

#### 2. 后端代理服务（Node.js + Express 示例）

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// 供应商配置映射（6 个企业级供应商）
const PROVIDER_CONFIG = {
  doubao: {
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.DOUBAO_API_KEY,
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: process.env.QWEN_API_KEY,
  },
  gpt: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
  },
  grok: {
    baseUrl: 'https://api.x.ai/v1',
    apiKey: process.env.GROK_API_KEY,
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: process.env.GEMINI_API_KEY,
  },
  perplexity: {
    baseUrl: 'https://api.perplexity.ai',
    apiKey: process.env.PERPLEXITY_API_KEY,
  },
};

// 代理端点
app.post('/v1/ai-proxy/chat/completions', async (req, res) => {
  try {
    const { provider, model, messages, temperature } = req.body;
    
    // 1. 验证员工身份（可选）
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!isValidEmployee(sessionToken)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 2. 获取供应商配置
    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }
    
    // 3. 转发请求到真实 AI 供应商
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature }),
    });
    
    const data = await response.json();
    
    // 4. 记录审计日志（可选）
    logAuditTrail({
      employee: sessionToken,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });
    
    // 5. 返回结果
    res.json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('AI Proxy running on port 3000');
});
```

#### 3. 服务器环境变量配置

```bash
# .env（服务器端，不提交到 Git）
DOUBAO_API_KEY=xxxxx
QWEN_API_KEY=sk-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
GROK_API_KEY=xai-xxxxx
GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PERPLEXITY_API_KEY=pplx-xxxxx
```

### 优势

- ✅ **绝对安全**：API Key 永远不会出现在前端代码或 GitHub 中。
- ✅ **集中管理**：所有密钥在服务器端统一管理，便于轮换和审计。
- ✅ **权限控制**：可以在网关层实现员工权限验证、额度限制、IP 白名单等。
- ✅ **审计日志**：记录每次 AI 调用的员工、时间、模型等信息，便于成本分析和合规审计。
- ✅ **防滥用**：可以设置单用户每日调用次数上限，防止恶意刷量。

### 劣势

- ⚠️ **运维成本**：需要额外的服务器资源和运维工作。
- ⚠️ **单点故障**：如果代理服务宕机，所有 AI 功能将不可用（可通过负载均衡缓解）。

### 适用场景

- 企业级生产环境
- 对安全性和合规性要求极高的场景
- 需要精细化权限控制和成本管理的团队

---

## 🔧 方案二：环境变量 + 构建时注入（适合小团队快速部署）

### 架构图

```
┌─────────────────┐
│  开发者本地      │
│  .env 文件       │
│  (不提交到 Git)  │
└────────┬────────┘
         │ 构建时通过 Vite 注入
         ↓
┌─────────────────────────────────┐
│  生产环境部署平台                │
│  (Vercel / Netlify / Cloudflare)│
│  环境变量配置界面                │
└────────┬────────────────────────┘
         │ 编译到前端 JS 文件
         ↓
┌─────────────────┐
│  用户浏览器      │
│  运行时读取      │
│  import.meta.env │
└─────────────────┘
```

### 实施步骤

#### 1. 创建 `.env` 文件（本地开发）

```bash
# .env（添加到 .gitignore，不提交到 Git）
VITE_DOUBAO_API_KEY=xxxxx
VITE_QWEN_API_KEY=sk-xxxxx
VITE_OPENAI_API_KEY=sk-proj-xxxxx
VITE_GROK_API_KEY=xai-xxxxx
VITE_GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_PERPLEXITY_API_KEY=pplx-xxxxx
```

#### 2. 修改 `.gitignore`

```bash
# .gitignore
.env
.env.local
.env.*.local
```

#### 3. 创建 `.env.example` 模板

```bash
# .env.example（提交到 Git，供团队成员参考）
VITE_DOUBAO_API_KEY=your_doubao_api_key_here
VITE_QWEN_API_KEY=your_qwen_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GROK_API_KEY=your_grok_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

#### 4. 修改 `src/services/ai.ts`

```typescript
// 从环境变量读取 API Key（6 个企业级供应商）
const INTERNAL_API_CONFIG: Record<string, { baseUrl: string; apiKey: string }> = {
  doubao: {
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: import.meta.env.VITE_DOUBAO_API_KEY || 'YOUR_DOUBAO_API_KEY',
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: import.meta.env.VITE_QWEN_API_KEY || 'YOUR_QWEN_API_KEY',
  },
  gpt: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
  },
  grok: {
    baseUrl: 'https://api.x.ai/v1',
    apiKey: import.meta.env.VITE_GROK_API_KEY || 'YOUR_GROK_API_KEY',
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GOOGLE_API_KEY',
  },
  perplexity: {
    baseUrl: 'https://api.perplexity.ai',
    apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY || 'YOUR_PERPLEXITY_API_KEY',
  },
};
```

#### 5. 生产环境配置（以 Vercel 为例）

1. 登录 Vercel 控制台
2. 进入项目设置 → Environment Variables
3. 添加以下 6 个变量：
   - `VITE_DOUBAO_API_KEY` = `xxxxx`
   - `VITE_QWEN_API_KEY` = `sk-xxxxx`
   - `VITE_OPENAI_API_KEY` = `sk-proj-xxxxx`
   - `VITE_GROK_API_KEY` = `xai-xxxxx`
   - `VITE_GEMINI_API_KEY` = `AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - `VITE_PERPLEXITY_API_KEY` = `pplx-xxxxx`
4. 重新部署项目

### 优势

- ✅ **实施简单**：无需额外服务器，适合快速原型和小团队。
- ✅ **部署灵活**：支持 Vercel、Netlify、Cloudflare Pages 等主流平台。
- ✅ **开发友好**：本地调试时直接读取 `.env` 文件，无需额外配置。
- ✅ **成本低**：无需维护额外的后端服务。

### 劣势

- ⚠️ **安全性较低**：虽然不在 Git 中，但 Key 会被编译到前端 JavaScript 文件中，技术上仍可通过浏览器开发者工具提取。
- ⚠️ **不适合公开部署**：如果应用对外公开访问，强烈不推荐此方案。
- ⚠️ **无权限控制**：任何能访问前端的用户理论上都能提取并滥用 API Key。
- ⚠️ **审计困难**：无法追踪具体是哪个员工发起的 AI 调用。

### 适用场景

- 内部工具（仅限公司内网访问）
- 快速原型验证
- 小团队（<10人）且成员互相信任
- 开发/测试环境

---

## 🔐 方案三：混合方案（推荐）

### 核心思路

**结合方案一和方案二的优势**：
- **开发阶段**：使用环境变量（方案二），方便本地调试。
- **生产环境**：使用后端代理（方案一），确保绝对安全。

### 实施步骤

#### 1. 修改 `src/services/ai.ts`

```typescript
// 根据环境自动切换配置
const isProduction = import.meta.env.MODE === 'production';

const INTERNAL_API_CONFIG: Record<string, { baseUrl: string; apiKey: string }> = {
  doubao: {
    baseUrl: isProduction 
      ? 'https://api.yourcompany.com/v1/ai-proxy'  // 生产：走代理
      : 'https://ark.cn-beijing.volces.com/api/v3', // 开发：直连
    apiKey: isProduction 
      ? 'internal-session-token' 
      : import.meta.env.VITE_DOUBAO_API_KEY || 'YOUR_DOUBAO_API_KEY',
  },
  gpt: {
    baseUrl: isProduction 
      ? 'https://api.yourcompany.com/v1/ai-proxy' 
      : 'https://api.openai.com/v1',
    apiKey: isProduction 
      ? 'internal-session-token' 
      : import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
  },
  // ... 其他供应商同理
};

// 发送请求时的逻辑调整
export async function sendToAI(
  userContent: string,
  settings: Settings,
  aiConfig: AIConfig
): Promise<AIResponse> {
  const isInternal = settings.apiMode === 'internal';
  const provider = settings.provider;
  
  const internalConfig = INTERNAL_API_CONFIG[provider] || INTERNAL_API_CONFIG.default;
  const baseUrl = isInternal ? internalConfig.baseUrl : settings.baseUrl;
  const apiKey = isInternal ? internalConfig.apiKey : settings.apiKey;
  
  // 生产环境下，需要在请求体中携带 provider 信息
  const requestBody: any = {
    model: settings.model,
    messages: messages,
    temperature: 0.7,
  };
  
  if (isProduction && isInternal) {
    requestBody.provider = provider; // 告诉代理服务要调用哪个供应商
  }
  
  const apiUrl = isProduction && isInternal 
    ? `${baseUrl}/chat/completions`  // 代理统一端点
    : `${baseUrl}/chat/completions`; // 直连各供应商
  
  // ... 后续请求逻辑
}
```

#### 2. 环境检测

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
```

### 优势

- ✅ **开发高效**：本地开发时直连 AI 供应商，调试方便。
- ✅ **生产安全**：生产环境强制走代理，Key 不暴露。
- ✅ **平滑过渡**：可以先用方案二快速上线，后续再迁移到方案一。
- ✅ **灵活切换**：通过环境变量控制，无需修改代码。

### 劣势

- ⚠️ **配置复杂**：需要维护两套配置逻辑。
- ⚠️ **测试成本**：需要分别测试开发和生产环境的行为。

### 适用场景

- **全生命周期覆盖**：从原型到生产的完整流程。
- **中大型团队**：既要保证开发效率，又要满足安全合规要求。

---

## 📊 方案对比总结

| 维度 | 方案一：后端代理 | 方案二：环境变量 | 方案三：混合方案 |
|------|-----------------|-----------------|-----------------|
| **安全性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **实施难度** | 中等 | 简单 | 中等 |
| **运维成本** | 高 | 低 | 中 |
| **开发效率** | 中 | 高 | 高 |
| **权限控制** | ✅ 支持 | ❌ 不支持 | ✅ 支持（生产） |
| **审计日志** | ✅ 支持 | ❌ 不支持 | ✅ 支持（生产） |
| **适合公开部署** | ✅ 是 | ❌ 否 | ✅ 是 |
| **适用场景** | 生产环境 | 内部工具/原型 | 全生命周期 |

---

## 🎯 推荐实施路径

### 阶段一：快速验证（1-2 天）

**目标**：确保所有 6 个供应商的 API 都能正常调通。

**方案**：采用**方案二（环境变量）**
1. 创建 `.env` 文件，填入所有供应商的 API Key。
2. 修改 `src/services/ai.ts`，从环境变量读取 Key。
3. 本地测试每个供应商的文本生成功能。
4. 确认无误后，将 `.env` 添加到 `.gitignore`。

### 阶段二：生产部署（1-2 周）

**目标**：搭建安全的生产环境。

**方案**：升级到**方案三（混合方案）**
1. 搭建简易的后端代理服务（推荐使用 Vercel Serverless Functions 或 Cloudflare Workers，成本极低）。
2. 修改前端代码，根据环境自动切换直连/代理模式。
3. 在生产环境配置代理服务的环境变量。
4. 部署并测试生产环境的 AI 调用流程。

### 阶段三：企业级增强（长期）

**目标**：完善审计、监控和权限控制。

**方案**：完善**方案一（后端代理）**
1. 实现员工身份验证（JWT Token）。
2. 添加审计日志（记录到数据库或日志服务）。
3. 实现额度监控和告警（防止超支）。
4. 配置负载均衡和故障转移（提高可用性）。

---

## 📝 附录：常见问题

### Q1: 如果使用方案二，Key 会被编译到 JS 文件中吗？

**A**: 是的。Vite 在构建时会将 `import.meta.env.VITE_*` 替换为实际的值，最终会出现在打包后的 JavaScript 文件中。虽然经过混淆，但技术上仍可被提取。因此**不推荐在公开部署的应用中使用方案二**。

### Q2: 后端代理服务需要多少服务器资源?

**A**: 非常少。一个简单的 Node.js 代理服务在 512MB 内存的服务器上就能稳定运行。如果使用 Serverless 方案（如 Vercel Functions），成本几乎为零（免费额度足够中小团队使用）。

### Q3: 如何防止代理服务被恶意调用？

**A**: 可以采取以下措施：
1. **IP 白名单**：只允许公司内网 IP 访问。
2. **Token 验证**：要求前端携带有效的员工 Token。
3. **速率限制**：限制单 IP 每分钟的请求次数。
4. **CORS 配置**：只允许特定域名的前端调用。

### Q4: 如果某个供应商的 API 格式不兼容 OpenAI 怎么办？

**A**: 在后端代理服务中进行格式转换。例如：

```javascript
if (provider === 'qwen') {
  // 通义千问可能需要特殊的请求头
  headers['X-DashScope-SSE'] = 'enable';
}
```

### Q5: 开发环境和生产环境如何无缝切换？

**A**: 使用环境变量 `NODE_ENV` 或 `VITE_MODE` 自动判断：

```typescript
const isDev = import.meta.env.DEV;
const baseUrl = isDev ? 'https://api.openai.com/v1' : 'https://api.yourcompany.com/v1/ai-proxy';
```

---

## 🔗 相关资源

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault)

---

**文档版本**: v1.0  
**最后更新**: 2026-01-08  
**维护者**: AI-SEO 开发团队
