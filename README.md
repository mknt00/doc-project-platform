# 文档与项目管理平台

一个基于 Node.js + Vue 3 + SQLite 的内部团队文档与项目管理平台，支持产品文档发布和项目进度管理。

## 功能特性

### 核心功能
- **用户认证系统**：用户注册、登录、JWT token 认证
- **项目管理**：创建、查看、编辑、删除项目
- **文档管理**：支持 Markdown 格式文档的创建、编辑、发布
- **任务管理**：创建任务、分配任务、跟踪任务状态
- **团队协作**：项目成员管理、任务分配
- **文档发布**：支持文档版本管理和发布流程

### 技术特性
- 响应式设计，支持移动端访问
- Markdown 文档编辑和预览
- 实时状态更新
- 简洁直观的用户界面

## 技术栈

### 后端
- **Node.js** + **Express**：服务器框架
- **SQLite**：轻量级数据库
- **JWT**：用户认证
- **bcryptjs**：密码加密
- **marked**：Markdown 解析

### 前端
- **Vue 3**：前端框架
- **TypeScript**：类型安全
- **Vue Router**：路由管理
- **Pinia**：状态管理
- **Axios**：HTTP 客户端
- **TailwindCSS**：样式框架

## 项目结构

```
doc-project-platform/
├── server/                 # 后端代码
│   ├── controllers/        # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由定义
│   ├── middleware/        # 中间件
│   ├── uploads/           # 文件上传目录
│   └── index.js           # 服务器入口
├── client/                # 前端代码
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── views/         # 页面视图
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── services/      # API 服务
│   │   └── router/        # 路由配置
│   └── public/            # 静态资源
├── database.sqlite        # SQLite 数据库文件
├── .env                   # 环境变量配置
└── package.json           # 项目依赖
```

## 安装和运行

### 前置要求
- Node.js 18+ 
- npm 或 pnpm

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

### 开发环境运行

**方式一：分别启动前后端**

```bash
# 终端1 - 启动后端服务器（端口 3000）
npm start

# 终端2 - 启动前端开发服务器（端口 5173）
cd client
npm run dev
```

**方式二：使用 npm scripts**

```bash
# 启动后端
npm run server

# 启动前端
npm run client
```

### 生产环境部署

```bash
# 构建前端
cd client
npm run build

# 启动后端服务器
cd ..
npm start
```

前端构建产物在 `client/dist` 目录，可以配置后端服务静态文件服务或使用 Nginx 等反向代理。

## 数据库结构

### 主要数据表

- **users**：用户表
  - 用户名、邮箱、密码（加密）、角色

- **projects**：项目表
  - 项目名称、描述、状态、所有者

- **documents**：文档表
  - 标题、内容、版本、状态、发布时间

- **tasks**：任务表
  - 标题、描述、状态、优先级、截止日期

- **project_members**：项目成员表
  - 项目-用户关联、角色

- **comments**：评论表
  - 文档/任务评论

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息

### 项目接口
- `GET /api/projects` - 获取所有项目
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `POST /api/projects/:id/members` - 添加项目成员
- `DELETE /api/projects/:id/members/:userId` - 移除项目成员

### 文档接口
- `GET /api/documents/published` - 获取已发布文档（公开）
- `POST /api/documents` - 创建文档
- `GET /api/projects/:projectId/documents` - 获取项目文档
- `GET /api/documents/:id` - 获取文档详情
- `PUT /api/documents/:id` - 更新文档
- `POST /api/documents/:id/publish` - 发布文档
- `DELETE /api/documents/:id` - 删除文档

### 任务接口
- `POST /api/tasks` - 创建任务
- `GET /api/projects/:projectId/tasks` - 获取项目任务
- `GET /api/tasks/my` - 获取我的任务
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

## 环境变量配置

### 后端 `.env`
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production-environment
NODE_ENV=development
```

### 前端 `client/.env`
```
VITE_API_URL=http://localhost:3000/api
```

## 使用说明

### 1. 注册和登录
- 首次使用需要注册账号
- 使用用户名和密码登录系统

### 2. 创建项目
- 登录后在项目列表页面点击"新建项目"
- 填写项目名称和描述
- 创建者自动成为项目所有者

### 3. 管理文档
- 进入项目详情页面
- 在"文档"标签页创建新文档
- 支持 Markdown 格式编写
- 文档可以保存为草稿或发布

### 4. 管理任务
- 在项目详情的"任务"标签页创建任务
- 设置任务优先级和截止日期
- 可以分配任务给项目成员
- 在"我的任务"页面查看分配给自己的任务

### 5. 查看已发布文档
- 在"已发布文档"页面查看所有公开发布的文档
- 点击文档可查看详细内容

## 安全性

- 密码使用 bcryptjs 加密存储
- API 使用 JWT token 认证
- 请在生产环境中修改 JWT_SECRET
- 建议配置 HTTPS

## 开发建议

### 添加新功能
1. 后端：在 `server/controllers/` 添加控制器逻辑
2. 后端：在 `server/routes/index.js` 添加路由
3. 前端：在 `client/src/services/api.ts` 添加 API 调用
4. 前端：在 `client/src/views/` 创建页面组件

### 数据库迁移
- 修改 `server/models/database.js` 中的表结构
- 删除 `database.sqlite` 文件重新初始化（开发环境）
- 生产环境建议使用数据库迁移工具

## 许可证

ISC

## 作者

内部团队开发

## 更新日志

### v1.0.0 (2026-01-02)
- 初始版本发布
- 实现基础的项目、文档、任务管理功能
- 用户认证和权限管理
- Markdown 文档支持
