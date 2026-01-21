# 上线前检查清单 (Pre-Deployment Checklist)

> **用途**: 项目上线前的全面检查清单，确保代码质量和文档完整性

---

## ✅ 代码质量检查

### 代码一致性
- [x] 所有 TypeScript 类型定义与代码实现一致
- [x] 视频模型列表 (`VIDEO_MODELS`) 仅包含 6 个供应商的模型
- [x] 文本模型列表 (`PROVIDER_MODELS`) 与代码实现一致
- [x] 模型名称规范化逻辑正确（Gemini、Qwen、Perplexity 等）

### 代码规范
- [x] 无 TypeScript 编译错误
- [x] 无 Lint 错误
- [x] 无未处理的 TODO/FIXME（除已知的 WordPress、usePageContent 等）
- [x] 所有遗留代码已清理（Runway、Kling、Hailuo、Pika、Luma 等模型已移除）

### 功能完整性
- [x] Internal Mode 和 Custom Mode 配置正确
- [x] 模型测试功能正常
- [x] 错误处理机制完善
- [x] 环境变量配置正确

---

## ✅ 安全检查

### API Key 安全
- [x] `.env` 文件已在 `.gitignore` 中
- [x] `.env.local` 和 `.env.*.local` 已忽略
- [x] `*.pem` 文件已忽略
- [x] 文档中无真实的 API Key（已使用占位符）
- [x] 代码中无硬编码的 API Key

### 生产环境配置
- [x] 生产环境支持代理服务（`VITE_PROXY_BASE_URL`）
- [x] 生产环境回退机制正确（未配置代理时回退到官方地址）
- [x] 开发环境使用环境变量配置 API Key

---

## ✅ 文档完整性

### README.md
- [x] 功能特性描述准确
- [x] 模型列表与代码一致
- [x] 安装步骤清晰
- [x] 部署指南完整
- [x] 环境变量配置说明准确
- [x] 配置说明完整

### API 部署文档 (API_CONFIGURATION.md)
- [x] 架构说明准确
- [x] 环境变量列表完整
- [x] 代码示例与当前实现一致
- [x] 生产环境配置说明清晰

### 其他文档
- [x] 项目结构说明准确
- [x] 注意事项完整

---

## ✅ 部署准备

### 构建检查
- [ ] 本地构建成功 (`npm run build`)
- [ ] 构建产物完整（`dist` 目录）
- [ ] 预览模式正常 (`npm run preview`)

### 环境变量准备
- [x] 开发环境 `.env` 文件已配置（本地测试用）
- [ ] 生产环境环境变量已准备 (LiteLLM Gateway):
    - `VITE_LITELLM_API_KEY`: 网关虚拟密钥 (Virtual Key)
    - `VITE_LITELLM_BASE_URL`: 网关 API 地址 (默认: https://litellm.xooer.com/v1)

### 部署平台配置
- [ ] 部署平台已选择（Vercel / Netlify / Cloudflare Pages / 自建服务器等）
- [ ] 部署平台环境变量已配置
- [ ] 构建命令已配置：`npm run build`
- [ ] 输出目录已配置：`dist`

---

## ✅ 测试检查

### 功能测试
- [ ] Internal Mode 文本生成测试
- [ ] Custom Mode 文本生成测试
- [ ] 视频生成测试（如果使用）
- [ ] 模型测试功能测试
- [ ] XOOBAY 产品集成测试（如果使用）
- [ ] WordPress 集成测试（如果使用）

### 跨域测试
- [ ] XOOBAY API 跨域配置（如果需要）
- [ ] WordPress API 跨域配置（如果需要）
- [ ] 错误提示友好性测试

### 浏览器兼容性
- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Edge（最新版）
- [ ] Safari（最新版）

---

## ✅ 上线步骤

### 最终检查
1. [ ] 代码已提交到 Git 仓库
2. [ ] 所有文档已更新
3. [ ] 环境变量已配置（生产环境）
4. [ ] 构建测试通过

### 部署执行
1. [ ] 执行构建命令：`npm run build`
2. [ ] 检查构建产物
3. [ ] 部署到目标平台
4. [ ] 验证部署成功

### 上线后验证
1. [ ] 访问部署地址，验证页面加载正常
2. [ ] 测试 Internal Mode 配置
3. [ ] 测试模型连接
4. [ ] 测试文本生成功能
5. [ ] 检查控制台无错误
6. [ ] 验证 API Key 安全（确认无泄露）

---

## 📝 注意事项

### 生产环境推荐配置
- **推荐使用代理服务**（方案一或方案三）：
  - 配置 `VITE_PROXY_BASE_URL` 和 `VITE_INTERNAL_SESSION_TOKEN`
  - API Key 不会暴露到前端代码
  - 更安全，支持审计和权限控制

- **仅内部使用时可考虑环境变量直连**（方案二）：
  - 仅在内部网络环境中使用
  - API Key 会被编译到前端代码中
  - 不推荐用于公开部署

### 模型配置说明
- **豆包 (Doubao)**: Model 字段应填写 Endpoint ID (ep-xxx)，而非模型名称
- **推理模型 (o1, o3)**: temperature 固定为 1，不支持自定义
- **GPT-5 系列**: temperature 固定为 1
- **模型名称**: 系统会自动处理大小写和格式转换

### 常见问题
- **CORS 错误**: 确保 XOOBAY API 和 WordPress API 已配置跨域权限
- **API Key 错误**: 检查环境变量配置是否正确
- **模型 404 错误**: 检查模型名称是否正确（系统会自动转换格式）

---

## 📅 检查日期

- **检查日期**: 2025-01-XX
- **检查人员**: [填写检查人员]
- **部署日期**: [填写部署日期]
- **部署人员**: [填写部署人员]

---

**最后更新**: 2025-01-XX
