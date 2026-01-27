# LiteLLM 配置检查清单 (LiteLLM Configuration Checklist)

致 LiteLLM 部署与维护团队：

AI-SEO 应用在与当前的 LiteLLM 网关集成时遇到了几个问题。请根据以下清单检查并更新服务器上的 `config.yaml` 文件，以确保应用功能可以正常使用。

---

### 1. 视频生成模型路由问题 (Urgent)

**问题描述：**
应用在调用视频生成功能时，向网关的 `/video/generations` 端点（endpoint）发送针对 `gemini/veo-2.0-generate-001` 模型的请求，但服务器返回 `404 Not Found` 错误。

**根本原因分析：**
这表明服务器端的 LiteLLM 配置与应用端的请求路径不匹配。应用调用 `https://litellm.xooer.com/v1/video/generations` 返回 `{"detail":"Not Found"}`。这通常意味着 LiteLLM 网关没有启用视频生成代理，或者没有将请求转发到正确的服务商。
**需要采取的行动：**
请检查 `config.yaml` 文件并确认/修改以下两点：
1.  **确认视频生成的正确 API 路径**：视频生成任务的 API 路径究竟是什么？如果不是 `/video/generations`，请提供正确的路径。
2.  **检查模型定义**：确保 `gemini/veo-2.0-generate-001` 模型已在 `model_list` 中正确定义，并且能够处理视频生成请求。

**配置示例（请根据您的实际环境调整）：**
```yaml
# config.yaml

model_list:
  - model_name: gemini/veo-2.0-generate-001
    litellm_params:
      # 这里应填写实际的 Google 或其他服务商的视频模型名称
      model: "google/gemini-2.0-pro-video" 
      api_key: os.environ/GOOGLE_API_KEY
      # LiteLLM 可能需要额外的参数来识别其为视频模型，请参考官方文档
```

---

### 2. 缺少“通义千问 (Qwen)”模型供应商

**问题描述：**
应用需要支持阿里云的“通义千问”系列模型，但目前 LiteLLM 网关似乎没有配置这些模型。

**需要采取的行动：**
请在 `config.yaml` 的 `model_list` 中添加通义千问的模型。

**配置示例（请根据您的实际环境调整）：**
```yaml
# config.yaml

model_list:
  # ... 其他模型
  - model_name: qwen-turbo
    litellm_params:
      model: qwen/qwen-turbo
      api_key: os.environ/QWEN_API_KEY # 确保服务器环境变量中已设置 QWEN_API_KEY

  - model_name: qwen-long
    litellm_params:
      model: qwen/qwen-long
      api_key: os.environ/QWEN_API_KEY
```

---

### 3. “豆包 (Doubao)”模型列表不完整

**问题描述：**
应用配置了多种豆包模型，但 LiteLLM 网关中似乎仅有一部分可用，缺少其他可选模型（如 `doubao-pro-32k`, `doubao-pro-128k` 等）。

**需要采取的行动：**
请检查 `config.yaml` 中豆包模型的配置，并根据需要添加缺失的型号。

**配置示例（请根据您的实际环境调整）：**
```yaml
# config.yaml

model_list:
  # ... 其他模型
  - model_name: doubao-pro-4k
    litellm_params:
      model: "completions/doubao-pro-4k"
      api_key: os.environ/DOUBAO_API_KEY # 确保服务器环境变量中已设置 DOUBAO_API_KEY

  - model_name: doubao-pro-32k
    litellm_params:
      model: "completions/doubao-pro-32k"
      api_key: os.environ/DOUBAO_API_KEY

  - model_name: doubao-pro-128k
    litellm_params:
      model: "completions/doubao-pro-128k"
      api_key: os.environ/DOUBAO_API_KEY
```

---

### 4. 需支持的完整模型清单 (Comprehensive List of Required Models)

以下是 AI-SEO 应用需要支持的完整模型清单。请确保这些模型均已在 `config.yaml` 的 `model_list` 中正确配置，并映射到相应的服务商。

#### Grok
- **文本 (Text):**
  - `xai/grok-4-1-fast-reasoning-latest`

#### 豆包 (Doubao)
- **深度思考 (Text):**
  - `doubao-pro-4k`
- **视频生成 (Video Generation):**
  - `doubao-seedance-1-5-pro-251215`

#### OpenAI
- **文本 (Text):**
  - `gpt-5.2` (Verified Custom Model)
  - `gpt-4` (Mapped to gpt-4-turbo)
  - `gpt-3.5-turbo`
- **视频生成 (Video Generation):**
  - `sora-2`
  - `sora-2-pro`

#### Anthropic (including Vertex)
- **文本 (Text):**
  - `claude-3-sonnet`
  - `vertex_ai/claude-sonnet-4-5`

#### Gemini
- **文本 (Text):**
  - `gemini-2.5-flash-lite` (As show in Admin Panel)
- **视频生成 (Video Generation):**
  - `gemini/veo-3.1-generate-preview`
  - `gemini/veo-3.0-generate-preview`

#### 通义千问 (Qwen)
- **文本 (Text):**
  - `qwen3-max`
  - `qwen-max-latest`
  - `qwen-max-0125`
  - `qwen-flash`
- **视频生成 (Video Generation):**
  - `wan2.6-t2v`
  - `wan2.5-t2v-preview`
  - `wan2.2-t2v-plus`

#### Perplexity
- **搜索模型 (Search):**
  - `Sonar`
  - `Sonar Pro`
  - `Sonar Reasoning Pro`
  - `Sonar Deep Research`

---

### 5. 模型连通性测试失败分析 (Connectivity Test Analysis)

根据应用端的“扫描测试”日志，以下模型目前在网关上不可用。请对照错误信息检查 `config.yaml` 或服务器环境变量。

| 模型识别码 | 报错状态 | 错误提示 (LiteLLM Error Message) | 需要采取的行动 |
| :--- | :--- | :--- | :--- |
| `doubao-pro-32k` | **400** | `There are no healthy deployments for this model` | 检查 `model_list` 是否定义了此名称，并在环境变量中填入正确的 `DOUBAO_API_KEY`。 |
| `anthropic/claude-3-sonnet-20240229` | **401** | `invalid x-api-key` | Anthropic 的 API Key 在网关上配置错误或已过期。 |
| `gemini/gemini-2.5-flash-lite` | **400** | `There are no healthy deployments for this model` | 确认 Google API Key 已具备该模型的访问权限。 |
| `qwen-max` | **400** | `There are no healthy deployments for this model` | 检查 `QWEN_API_KEY` 是否有效。 |
| `sonar` (Perplexity) | **400** | `There are no healthy deployments for this model` | 确认 Perplexity 的模型识别码配置正确。 |

**重要提示**：目前的网关扫描结果显示，**只有** `gemini/veo-3.1-generate-preview` 虽然受到 Google 配额限制（429），但在网关端是配置成功的。其他模型均处于“未健康部署”或“未授权”状态。

如有任何疑问，请随时沟通。