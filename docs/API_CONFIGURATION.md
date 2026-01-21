# API 部署与配置指南 (Deployment Guide)

本手册专为部署人员编写，旨在指导如何配置 AI SEO 后端的 API 环境，特别是针对 **LiteLLM Gateway** 的集成。

## 1. 核心架构 (Core Architecture)

应用采用 **"轻客户端"** 设计，所有的请求通过统一的 LiteLLM 网关进行路由。

- **网关地址**: `https://litellm.xooer.com/v1` (默认)
- **协议标准**: OpenAI Chat Completions API
- **认证方式**: `Authorization: Bearer {VIRTUAL_KEY}`

## 2. 环境变量配置 (.env)

在项目根目录下创建 `.env` 文件，配置企业托管模式所需的密钥：

```bash
# LiteLLM 网关 API Key (必填: 企业模式使用)
VITE_LITELLM_API_KEY=sk-xxxx...

# LiteLLM 网关 Base URL (可选: 默认为 https://litellm.xooer.com/v1)
VITE_LITELLM_BASE_URL=https://your-gateway.com/v1
```

## 3. 网关端模型映射 (Model Mapping)

部署网关时，请确保以下 **Model ID** 已正确映射到对应的服务供应商及其 API Key：

| 供应商 | 应用内使用的 Model ID (Request Body) | 建议网关配置的名称 (LiteLLM model_name) |
| :--- | :--- | :--- |
| **OpenAI** | `gpt-5.2` | `gpt-5.2` |
| **OpenAI** | `gpt-4` | `gpt-4` |
| **Google** | `gemini/gemini-2.5-flash-lite` | `gemini/gemini-2.5-flash-lite` |
| **xAI** | `xai/grok-4-1-fast-reasoning-latest` | `xai/grok-4-1-fast-reasoning-latest` |
| **Anthropic** | `anthropic/claude-3-sonnet-20240229` | `anthropic/claude-3-sonnet-20240229` |

> [!IMPORTANT]
> **关于占位模型**: 应用界面还保留了 Doubao, Qwen, Perplexity 的图标。如需启用，请在网关配置对应的模型名。

## 4. 安全审计建议 (Security Audit)

- **CORS 配置**: 应用通过 `fetch` 直接调用网关。网关必须在响应头中配置 `Access-Control-Allow-Origin: *` (或具体的扩展 ID)。
- **密钥保护**: 生产环境下，`.env` 文件应被排除在代码库之外（已在 `.gitignore` 中配置）。
- **Virtual Key**: 建议为部署人员分配具有配额限制的 Virtual Key，而非 Master Key。

## 5. 常见问题排查 (Troubleshooting)

- **400 Bad Request**: 网关未识别 `model` 参数。请检查网关是否配置了对应的映射名。
- **401 Unauthorized**: `VITE_LITELLM_API_KEY` 错误或已过期。
- **CORS Error**: 网关未正确配置跨域请求头。

---
*文档版本: v2.0.0 | 最后更新: 2026-01-19*
