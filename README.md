# sharecraft
## Project description

项目地址：https://sharecraft.lc404.cn
- 这是一个用于创建活动页/落地页/分享页海报并支持在线浏览的零代码建站网站
- 你可以通过添加元素、拖拽元素、改变元素属性的方式来丰富你的分享页
- 🆕 **新增AI Agent功能**：通过自然语言对话自动生成页面组件，大幅提升设计效率

生成的活动页预览页


![alt](https://sharecraft-backend.oss-cn-shanghai.aliyuncs.com/sharecraft-test/AYLX4q.png)

## Technology
- 前端：Vue3.4、Vuex、ant-design-vue、TypeScript
  - [自定义组件库：https://github.com/iacg-world/iacg-block](https://github.com/iacg-world/iacg-block)
  - [前端监控JSSDK：https://github.com/iacg-world/iacg-monitor](https://github.com/iacg-world/iacg-monitor)
- 服务端：egg、TypeScript、MongoDB
  - [服务端项目仓库：https://github.com/iacg-world/sharecraft-backend](https://github.com/iacg-world/sharecraft-backend)
- 部署：Docker、nginx、github action
- 云服务：阿里云ACR、阿里云OSS、阿里云短信服务
- 🤖 AI功能：支持OpenAI、Claude等主流AI模型，实现智能页面生成

## AI Agent 功能

### 🌟 主要特性
- **智能对话界面**：现代化聊天UI，支持快捷键操作
- **预定义模板**：内置登录、产品展示、联系我们、新闻文章等常用页面模板
- **智能样式解析**：自动识别颜色、字体大小、布局位置等样式要求
- **一键应用**：生成的页面结构可直接应用到编辑器，支持进一步调整

### 🚀 使用方法
1. 进入编辑器页面，点击右下角的悬浮AI助手按钮
2. 首次使用时，点击"AI设置"按钮配置你的API信息：
   - 选择AI服务提供商（OpenAI/Claude/自定义）
   - 输入API Key
   - 配置模型和参数
3. 描述你想要的页面设计，例如：
   - "创建一个简单的登录页面"
   - "设计一个产品展示卡片"
   - "制作一个红色标题，24px字体，居中显示"
4. 点击"应用到编辑器"即可将生成的组件添加到画布

### 🔧 配置AI服务
1. 在项目根目录创建 `.env` 文件
2. 配置你的AI服务提供商和API Key：
```bash
# OpenAI配置
VUE_APP_AI_PROVIDER=openai
VUE_APP_AI_API_KEY=sk-your-openai-api-key-here
VUE_APP_AI_BASE_URL=https://api.openai.com/v1
VUE_APP_AI_MODEL=gpt-3.5-turbo
VUE_APP_AI_MAX_TOKENS=1500
VUE_APP_AI_TEMPERATURE=0.7

# 或者使用Claude
# VUE_APP_AI_PROVIDER=claude
# VUE_APP_AI_API_KEY=your-claude-api-key-here
# VUE_APP_AI_BASE_URL=https://api.anthropic.com/v1
# VUE_APP_AI_MODEL=claude-3-sonnet-20240229
```
3. 重启开发服务器：`npm run dev`

详细文档请参考：[AI_AGENT_README.md](./AI_AGENT_README.md)
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
