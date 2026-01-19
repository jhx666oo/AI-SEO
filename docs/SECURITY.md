# 🔐 安全配置指南

## 环境变量安全管理

### ⚠️ 重要安全提醒

**永远不要**:
- ❌ 将 `.env` 文件提交到 Git
- ❌ 在代码中硬编码 API Keys
- ❌ 在文档中包含真实的 API Keys
- ❌ 在截图中暴露 API Keys
- ❌ 在日志中打印 API Keys

**始终确保**:
- ✅ `.env` 文件在 `.gitignore` 中
- ✅ 使用 `.env.example` 作为模板（只包含占位符）
- ✅ 定期轮换 API Keys（建议每 90 天）
- ✅ 为不同环境使用不同的 Keys
- ✅ 监控 API 使用情况

---

## 快速检查清单

### 在提交代码前

```bash
# 1. 确认 .env 不在 Git 中
git status | grep .env
# 应该没有 .env，只有 .env.example

# 2. 确认 .gitignore 正确配置
cat .gitignore | grep .env
# 应该看到 .env 被排除

# 3. 检查是否有硬编码的 Keys
grep -r "sk-" src/
grep -r "AIza" src/
# 应该没有输出
```

### 定期安全审计

```bash
# 检查 Git 历史中是否有 .env
git log --all --full-history -- .env

# 如果有输出，说明 .env 曾被提交，需要立即处理！
```

---

## API Key 轮换流程

### 何时轮换

1. **定期轮换**: 每 90 天
2. **泄露响应**: 发现泄露后 1 小时内
3. **团队变动**: 成员离职时
4. **异常检测**: 发现异常 API 使用时

### 如何轮换

1. **生成新 Key**（在供应商平台）
2. **更新 `.env` 文件**
3. **测试新 Key**
4. **撤销旧 Key**
5. **更新生产环境**（如果已部署）

---

## 生产环境最佳实践

### 推荐方案：使用后端代理

```
浏览器 → 后端代理服务器 → AI 供应商 API
         (存储 API Keys)
```

**优势**:
- ✅ API Keys 不暴露在前端
- ✅ 统一管理和监控
- ✅ 实现配额和限流
- ✅ 更好的安全性

### 环境变量注入

**Vercel / Netlify**:
- 在平台设置中配置环境变量
- 不要在代码中包含 `.env`

**Docker**:
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.production  # 不提交到 Git
```

**Kubernetes**:
```yaml
# 使用 Secrets
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
type: Opaque
data:
  openai-key: <base64-encoded-key>
```

---

## Git Hooks 自动保护

创建 `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 运行安全检查..."

# 检查 .env 文件
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ 错误: 不允许提交 .env 文件！"
    exit 1
fi

# 检查疑似 API Key
if git diff --cached | grep -qE "(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9]{35}|xai-[a-zA-Z0-9]{20,})"; then
    echo "⚠️  警告: 检测到疑似 API Key！"
    echo "请确认是否为示例值。"
    read -p "确认继续提交？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ 安全检查通过"
```

使其可执行:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 紧急响应流程

### 如果发现 API Key 泄露

1. **立即撤销所有可能泄露的 Keys**
2. **生成新的 Keys**
3. **更新所有环境的配置**
4. **检查 API 使用日志**，确认是否被滥用
5. **联系供应商客服**，说明情况
6. **清理 Git 历史**（如果在 Git 中）

### 清理 Git 历史

```bash
# 使用 BFG Repo-Cleaner（推荐）
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

---

## 监控和审计

### 定期检查

- **每周**: 检查 API 使用量
- **每月**: 审查访问日志
- **每季度**: 轮换 API Keys
- **每年**: 全面安全审计

### 使用工具

```bash
# 安装 gitleaks
brew install gitleaks

# 扫描仓库
gitleaks detect --source . --verbose
```

---

## 相关文档

- [API 部署与配置指南](./API_CONFIGURATION.md)
- [Web 域名部署指南](./WEB_DEPLOYMENT_GUIDE.md)
- [上线前检查清单](./DEPLOYMENT_CHECKLIST.md)

---

**记住**: 安全是持续的过程，不是一次性的任务！
