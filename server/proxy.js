/**
 * AI Proxy Service for Internal Mode (Production)
 * 
 * 功能说明：
 * - 接收前端的 AI 请求（不含真实 API Key）
 * - 从环境变量中读取真实的供应商 API Key
 * - 转发请求到对应的 AI 供应商
 * - 返回响应给前端
 * 
 * 部署方式：
 * 1. Vercel Serverless Functions
 * 2. Cloudflare Workers
 * 3. 自建 Node.js 服务器
 * 
 * 环境变量配置（必须）：
 * - DOUBAO_API_KEY
 * - QWEN_API_KEY
 * - OPENAI_API_KEY
 * - GROK_API_KEY
 * - GEMINI_API_KEY
 * - PERPLEXITY_API_KEY
 */

const express = require('express');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 供应商配置映射
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

/**
 * 验证员工身份（可选）
 */
function isValidEmployee(token) {
    // TODO: 实现真实的身份验证逻辑
    // 例如：查询数据库、验证 JWT Token 等
    return token && token !== 'invalid';
}

/**
 * 记录审计日志（可选）
 */
function logAuditTrail(data) {
    console.log('[Audit Trail]', JSON.stringify(data, null, 2));
    // TODO: 将日志写入数据库或日志服务
}

/**
 * AI 代理端点
 */
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

        if (!config.apiKey) {
            return res.status(500).json({ error: `API Key not configured for provider: ${provider}` });
        }

        // 3. 转发请求到真实 AI 供应商
        const fetch = (await import('node-fetch')).default;
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
            status: response.status,
        });

        // 5. 返回结果
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('[Proxy Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器（本地开发）
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`AI Proxy Server running on port ${PORT}`);
    });
}

// 导出为 Serverless Function（Vercel/Netlify）
module.exports = app;
