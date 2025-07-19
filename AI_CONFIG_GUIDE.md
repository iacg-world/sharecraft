# AI 配置指南

## 🔧 环境变量配置

为了使用真实的AI API，你需要在项目根目录创建 `.env` 文件并配置以下环境变量：

### OpenAI 配置

```bash
# 选择AI服务提供商
VITE_AI_PROVIDER=openai

# OpenAI API配置
VITE_AI_API_KEY=sk-your-openai-api-key-here
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_MODEL=gpt-3.5-turbo

# 生成参数
VITE_AI_MAX_TOKENS=1500
VITE_AI_TEMPERATURE=0.7
```

### Claude 配置

```bash
# 选择AI服务提供商
VITE_AI_PROVIDER=claude

# Claude API配置
VITE_AI_API_KEY=your-claude-api-key-here
VITE_AI_BASE_URL=https://api.anthropic.com/v1
VITE_AI_MODEL=claude-3-sonnet-20240229

# 生成参数
VITE_AI_MAX_TOKENS=1500
VITE_AI_TEMPERATURE=0.7
```

## 🚀 快速开始

### 1. 获取API Key

#### OpenAI
1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 登录你的OpenAI账户
3. 点击 "Create new secret key"
4. 复制生成的API Key

#### Claude (Anthropic)
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 登录你的Anthropic账户
3. 在API Keys页面创建新的API Key
4. 复制生成的API Key

### 2. 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# 复制下面的配置并替换为你的实际API Key
VITE_AI_PROVIDER=openai
VITE_AI_API_KEY=your-actual-api-key-here
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_MODEL=gpt-3.5-turbo
VITE_AI_MAX_TOKENS=1500
VITE_AI_TEMPERATURE=0.7
```

### 3. 重启开发服务器

配置完成后，重启开发服务器：

```bash
npm run dev
```

### 4. 测试AI功能

1. 进入编辑器页面
2. 点击右下角的悬浮AI助手按钮
3. 输入测试消息："创建一个登录页面"
4. 检查浏览器控制台是否有API调用日志

## 📊 配置参数说明

### VITE_AI_PROVIDER
- **类型**: string
- **可选值**: `openai`, `claude`, `custom`
- **说明**: 选择AI服务提供商

### VITE_AI_API_KEY
- **类型**: string
- **说明**: AI服务的API密钥，必需配置

### VITE_AI_BASE_URL
- **类型**: string
- **说明**: AI API的基础URL
- **OpenAI**: `https://api.openai.com/v1`
- **Claude**: `https://api.anthropic.com/v1`

### VITE_AI_MODEL
- **类型**: string
- **说明**: 使用的AI模型
- **OpenAI常用模型**: 
  - `gpt-3.5-turbo` (推荐，性价比高)
  - `gpt-4` (质量更高，成本更高)
  - `gpt-4-turbo-preview` (最新模型)
- **Claude常用模型**:
  - `claude-3-sonnet-20240229` (推荐)
  - `claude-3-opus-20240229` (质量最高)

### VITE_AI_MAX_TOKENS
- **类型**: number
- **默认值**: 1500
- **说明**: 生成内容的最大token数量

### VITE_AI_TEMPERATURE
- **类型**: number (0-1)
- **默认值**: 0.7
- **说明**: 控制生成内容的随机性，0最保守，1最创意

## 🔍 调试和故障排除

### 检查配置是否正确

在浏览器控制台查看AI配置信息：

```javascript
// 应该显示类似这样的输出
AI配置信息: {
  provider: "openai",
  baseUrl: "https://api.openai.com/v1", 
  model: "gpt-3.5-turbo",
  maxTokens: 1500,
  temperature: 0.7,
  hasApiKey: true
}
```

### 常见问题

#### 问题1: API Key无效
**错误**: `401 Unauthorized` 或 `Invalid API Key`
**解决方案**: 
- 检查API Key是否正确复制
- 确认API Key没有过期
- 验证账户是否有足够的余额

#### 问题2: 网络连接问题
**错误**: `Network Error` 或 `Failed to fetch`
**解决方案**:
- 检查网络连接
- 确认API Base URL是否正确
- 检查是否有代理或防火墙限制

#### 问题3: 配置未生效
**错误**: 控制台显示 `hasApiKey: false`
**解决方案**:
- 确认 `.env` 文件在项目根目录
- 检查环境变量名称是否正确（注意大小写）
- 重启开发服务器

#### 问题4: JSON解析错误
**错误**: `Parse AI response error`
**解决方案**:
- 检查AI模型是否支持JSON格式输出
- 尝试降低temperature值
- 检查prompt是否明确要求JSON格式

### 启用调试模式

在AI API文件中，可以启用更详细的调试日志：

```typescript
// 在aiApi.ts中添加调试日志
console.log('发送到AI的请求:', apiRequest)
console.log('AI返回的原始内容:', aiReply)
```

## 💰 成本控制

### OpenAI定价参考 (2024年)
- **GPT-3.5-turbo**: $0.001/1K tokens (输入) + $0.002/1K tokens (输出)
- **GPT-4**: $0.03/1K tokens (输入) + $0.06/1K tokens (输出)

### Claude定价参考 (2024年)
- **Claude-3-Sonnet**: $0.003/1K tokens (输入) + $0.015/1K tokens (输出)
- **Claude-3-Opus**: $0.015/1K tokens (输入) + $0.075/1K tokens (输出)

### 节省成本的建议
1. 使用GPT-3.5-turbo进行开发和测试
2. 设置合理的MAX_TOKENS限制
3. 优化prompt长度
4. 考虑缓存常用模板

## 🔐 安全注意事项

1. **不要提交API Key到版本控制**
   - 确保 `.env` 在 `.gitignore` 中
   - 使用环境变量而不是硬编码

2. **API Key权限控制**
   - 只给必需的权限
   - 定期轮换API Key
   - 监控API使用情况

3. **用户输入验证**
   - 限制输入长度
   - 过滤敏感内容
   - 实施速率限制

## 🚀 高级配置

### 自定义AI服务

如果你使用自定义的AI服务，需要确保它兼容OpenAI的API格式：

```bash
VITE_AI_PROVIDER=custom
VITE_AI_API_KEY=your-custom-api-key
VITE_AI_BASE_URL=https://your-ai-service.com/v1
VITE_AI_MODEL=your-custom-model
```

### 代理配置

如果需要通过代理访问AI服务，可以配置代理URL：

```bash
VITE_AI_BASE_URL=https://your-proxy-server.com/api/openai/v1
```

## 📈 监控和分析

建议添加以下监控指标：

1. **API调用成功率**
2. **响应时间**
3. **Token使用量**
4. **错误类型分布**
5. **用户满意度**

可以通过在代码中添加相关统计来实现监控。 