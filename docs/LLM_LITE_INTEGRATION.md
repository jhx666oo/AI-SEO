# LLM Lite 对接指南

## 📋 目录
1. [当前架构分析](#当前架构分析)
2. [LLM Lite 对接方案](#llm-lite-对接方案)
3. [需要修改的文件](#需要修改的文件)
4. [配置步骤](#配置步骤)
5. [测试验证](#测试验证)
6. [常见问题](#常见问题)

---

## 当前架构分析

### 简化后的 API 调用流程

```
浏览器扩展 (App.tsx)
    ↓
useAI Hook (useAI.ts)
    ↓
AI Service (ai.ts)
    ↓ [根据 apiMode 选择]
    ├─ Enterprise Mode → 读取 .env 环境变量 (VITE_LITELLM_API_KEY)
    └─ DIY Mode → 用户手动输入 Virtual Key
    ↓
统一调用 LiteLLM Gateway (/chat/completions)
```

### 关键配置位置

#### 1. **Settings 类型定义** (`src/types/index.ts`)
- `apiMode`: 'internal' (企业托管) 或 'diy' (自定义)
- `baseUrl`: 默认为 `https://litellm.xooer.com/v1`
- `apiKey`: LiteLLM Virtual Key

#### 2. **AI Service** (`src/services/ai.ts`)
- 移除了所有供应商特定的处理逻辑。
- 统一使用 `Authorization: Bearer {apiKey}`。
- 所有请求（文本和视频）均发送至 `${baseUrl}/chat/completions`。

---

## LLM Lite 对接方案

### 方案概述

**好消息**：当前架构已经为 LLM Lite 对接做好了准备！只需要配置，**无需修改代码**。

```
浏览器扩展 (App.tsx)
    ↓
useAI Hook (useAI.ts)
    ↓
AI Service (ai.ts)
    ↓ [DIY Mode]
settings.baseUrl = "https://your-llm-lite-server.com/v1"
settings.apiKey = "your-llm-lite-api-key"
    ↓
LLM Lite 中转服务器
    ↓ [绕过 CORS]
各供应商 API (OpenAI/Gemini/Doubao/Sora等)
```

### 为什么现有架构已经支持？

1. ✅ **DIY 模式已存在** - 用户可以自定义 `baseUrl` 和 `apiKey`
2. ✅ **统一接口格式** - 所有请求都使用 OpenAI 兼容格式
3. ✅ **视频 API 已集成** - `generateVideo()` 和 `pollVideoTask()` 都支持自定义 baseUrl
4. ✅ **设置界面已完成** - UI 中已有 baseUrl 和 apiKey 输入框

---

## 需要修改的文件

### ⚠️ 重要：实际上**不需要修改任何代码**！

只需要在 **LLM Lite 服务器端**实现以下接口：

### LLM Lite 服务器需要实现的接口

#### 1. **文本生成接口** (OpenAI 兼容)
```
POST https://your-llm-lite-server.com/v1/chat/completions

Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body:
{
  "model": "gpt-4o",  // 或其他模型
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.7,
  "stream": false
}

Response:
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "生成的内容..."
    }
  }]
}
```

#### 2. **视频生成接口** (需要实现)
```
POST https://your-llm-lite-server.com/v1/chat/completions

Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json

Body:
{
  "model": "sora-2",  // 视频模型
  "messages": [
    { "role": "system", "content": "视频生成系统提示词" },
    { "role": "user", "content": "产品描述" }
  ],
  "video_config": {
    "duration": 5,
    "width": 1920,
    "height": 1080,
    // ... 其他视频配置
  }
}

Response (异步任务):
{
  "task_id": "video-task-12345",
  "status": "pending",
  "prompt": "生成的视频提示词"
}
```

#### 3. **视频轮询接口** (需要实现)
```
GET https://your-llm-lite-server.com/v1/tasks/{task_id}

Headers:
  Authorization: Bearer {apiKey}

Response (进行中):
{
  "status": "processing",
  "progress": 45
}

Response (完成):
{
  "status": "completed",
  "video_url": "https://cdn.example.com/video.mp4",
  "prompt": "视频提示词"
}

Response (失败):
{
  "status": "failed",
  "error": "错误信息"
}
```

---

## 配置步骤

### 步骤 1: 部署 LLM Lite 服务器

确保您的 LLM Lite 服务器：
1. ✅ 实现了上述三个接口
2. ✅ 配置了 CORS 允许浏览器扩展访问
3. ✅ 支持 OpenAI 兼容的 API 格式
4. ✅ 能够转发请求到各个供应商 API

### 步骤 2: 在扩展中配置 LLM Lite

用户在使用扩展时，需要：

1. **打开设置弹窗**（点击右上角设置图标）

2. **切换到 DIY 模式**
   - 在设置界面顶部，切换 API 模式为 "DIY Mode"

3. **配置 LLM Lite 地址**
   ```
   Base URL: https://your-llm-lite-server.com/v1
   API Key: your-llm-lite-api-key
   ```

4. **选择供应商和模型**
   ```
   Provider: gpt (或其他)
   Model: gpt-4o (或其他)
   ```

5. **保存配置**

### 步骤 3: 测试连接

1. 在设置界面点击 **"立即扫描"** 按钮
2. 系统会测试所有供应商的连通性
3. 确认 LLM Lite 返回正确的响应

---

## 测试验证

### 文本生成测试

1. 选择一个产品
2. 进入步骤 2 校对内容
3. 进入步骤 3 配置策略
   - 选择 "文本生成" 模式
   - 选择目标语言和输出格式
4. 点击 "下一步" 生成内容
5. 验证生成的内容是否正确

### 视频生成测试

1. 选择一个产品
2. 进入步骤 2 校对内容
3. 进入步骤 3 配置策略
   - 选择 "视频生成" 模式
   - 选择视频模型（如 Sora 2）
   - 选择视频风格
4. 点击 "下一步" 生成视频
5. 观察轮询进度
6. 验证视频是否生成成功

---

## 常见问题

### Q1: 为什么视频生成需要 LLM Lite？

**A**: 视频模型的原生 API（如 Google Veo）禁止浏览器直接调用（CORS 限制）。LLM Lite 作为中转服务器可以：
- ✅ 绕过浏览器的 CORS 限制
- ✅ 统一管理 API 密钥（更安全）
- ✅ 实现请求限流和配额管理
- ✅ 提供统一的错误处理

### Q2: 文本生成也需要 LLM Lite 吗？

**A**: 不一定。文本模型（GPT/Gemini/Claude等）通常提供了 CORS 友好的接口，可以直接调用。但使用 LLM Lite 有以下好处：
- ✅ 统一管理所有 API
- ✅ 更好的安全性（API 密钥不暴露在前端）
- ✅ 统一的日志和监控
- ✅ 更灵活的配额和计费管理

### Q3: 如何处理 API 密钥安全问题？

**A**: 
- **Internal Mode**: API 密钥存储在环境变量中，不暴露给用户
- **DIY Mode**: 用户自己提供 LLM Lite 的 API Key，存储在本地 Chrome Storage
- **推荐**: 企业用户使用 Internal Mode + LLM Lite，个人用户使用 DIY Mode

### Q4: LLM Lite 需要支持哪些模型？

**A**: 根据 `src/types/index.ts` 中的定义：

**文本模型**:
- Doubao: `doubao-pro-32k`, `doubao-lite-32k` 等
- GPT: `gpt-4o`, `gpt-4o-mini`, `o1`, `o1-mini` 等
- Gemini: `gemini-2.0-flash-exp`, `gemini-1.5-pro` 等
- Claude: `claude-3-5-sonnet-20241022` 等
- Qwen: `qwen-max`, `qwen-plus` 等

**视频模型**:
- Sora: `sora-2`, `sora-2-pro`
- Doubao: `doubao-seedance-1.5-pro`
- Qwen: `qwen-wan-2.6`, `qwen-wan-2.5-preview` 等

### Q5: 如何调试 LLM Lite 对接问题？

**A**: 
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页的日志
3. 关键日志标识：
   - `[AI Service]` - AI 服务调用日志
   - `[Video API]` - 视频 API 调用日志
   - `[Polling]` - 视频轮询日志
4. 检查 Network 标签页的请求详情

---

## 代码参考

### 如果需要自定义 LLM Lite 路由

虽然不需要修改前端代码，但如果您的 LLM Lite 使用不同的路由，可以修改：

**文件**: `src/services/ai.ts`

**文本生成 API 路由** (第380行):
```typescript
let apiUrl = `${baseUrl}/chat/completions`;  // 改为您的路由
```

**视频生成 API 路由** (第1156行):
```typescript
let apiUrl = `${baseUrl}/chat/completions`;  // 改为您的路由
```

**视频轮询 API 路由** (第1261行):
```typescript
const apiUrl = `${baseUrl}/tasks/${taskId}`;  // 改为您的路由
```

---

## 总结

### ✅ 优势

1. **无需修改前端代码** - 当前架构已完美支持
2. **配置简单** - 只需在设置中填写 LLM Lite 地址和密钥
3. **统一管理** - 所有 API 调用都通过 LLM Lite 中转
4. **安全可靠** - API 密钥不暴露在前端
5. **灵活扩展** - 可以随时添加新的模型和供应商

### 📝 待办事项

**LLM Lite 服务器端**:
- [ ] 实现 `/v1/chat/completions` 接口（文本和视频）
- [ ] 实现 `/v1/tasks/{task_id}` 接口（视频轮询）
- [ ] 配置 CORS 允许浏览器扩展访问
- [ ] 实现 API 密钥验证和配额管理
- [ ] 添加日志和监控

**前端配置**:
- [ ] 在设置中配置 LLM Lite 地址
- [ ] 测试文本生成功能
- [ ] 测试视频生成功能
- [ ] 验证所有供应商和模型

---

## 联系支持

如有任何问题，请查看：
- 前端日志: 浏览器开发者工具 Console
- 后端日志: LLM Lite 服务器日志
- API 文档: 参考 OpenAI API 规范

祝对接顺利！🚀
