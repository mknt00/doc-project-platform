# 部署指南

本文档介绍如何将文档与项目管理平台部署到生产环境。

## 部署架构

推荐的生产环境架构：

```
[用户] → [Nginx反向代理] → [Node.js后端 (PM2)] + [SQLite数据库]
                          → [静态前端文件]
```

## 服务器要求

- **操作系统**：Linux (Ubuntu 20.04+ 推荐)
- **Node.js**：v18.0.0 或更高版本
- **内存**：最低 512MB，推荐 1GB+
- **磁盘**：最低 1GB 可用空间
- **网络**：公网 IP 或域名

## 部署步骤

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

### 2. 上传代码

```bash
# 方式一：使用 Git
cd /var/www
sudo git clone <your-repository-url> doc-platform
cd doc-platform

# 方式二：使用 SCP
scp -r ./doc-project-platform user@server:/var/www/doc-platform
```

### 3. 安装依赖

```bash
cd /var/www/doc-platform

# 安装后端依赖
npm install --production

# 安装前端依赖并构建
cd client
npm install
npm run build
```

### 4. 配置环境变量

```bash
# 编辑后端环境变量
cd /var/www/doc-platform
sudo nano .env
```

生产环境 `.env` 配置：

```
PORT=3000
JWT_SECRET=<生成一个强随机密钥>
NODE_ENV=production
```

生成强随机密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. 配置 PM2

创建 PM2 配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'doc-platform',
    script: './server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
}
```

启动应用：

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs doc-platform
```

### 6. 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/doc-platform
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 前端静态文件
    location / {
        root /var/www/doc-platform/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads {
        alias /var/www/doc-platform/server/uploads;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/doc-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 7. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

### 8. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH（如果还没允许）
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

## 数据库备份

### 自动备份脚本

创建备份脚本 `/var/www/doc-platform/backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/doc-platform"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/var/www/doc-platform/database.sqlite"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_FILE $BACKUP_DIR/database_$DATE.sqlite

# 压缩备份
gzip $BACKUP_DIR/database_$DATE.sqlite

# 删除 30 天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: database_$DATE.sqlite.gz"
```

设置定时任务：

```bash
# 添加执行权限
chmod +x /var/www/doc-platform/backup.sh

# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /var/www/doc-platform/backup.sh >> /var/log/doc-platform-backup.log 2>&1
```

## 监控和维护

### 查看应用状态

```bash
# PM2 状态
pm2 status
pm2 logs doc-platform

# Nginx 状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
tail -f /var/www/doc-platform/logs/err.log
```

### 更新应用

```bash
cd /var/www/doc-platform

# 拉取最新代码
git pull

# 更新依赖
npm install --production

# 重新构建前端
cd client
npm install
npm run build

# 重启应用
cd ..
pm2 restart doc-platform
```

### 性能优化

1. **启用 Gzip 压缩**（在 Nginx 配置中）：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

2. **设置静态文件缓存**：
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **增加 PM2 实例数**：
```bash
pm2 scale doc-platform 4  # 根据 CPU 核心数调整
```

## 故障排查

### 应用无法启动

```bash
# 检查端口占用
sudo lsof -i :3000

# 查看详细错误
pm2 logs doc-platform --err

# 检查环境变量
pm2 env 0
```

### 数据库锁定问题

```bash
# 检查数据库文件权限
ls -la database.sqlite

# 修复权限
sudo chown www-data:www-data database.sqlite
sudo chmod 664 database.sqlite
```

### Nginx 502 错误

```bash
# 检查后端是否运行
pm2 status

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 测试后端直接访问
curl http://localhost:3000/health
```

## 安全建议

1. **定期更新系统和依赖**
2. **使用强密码和 JWT 密钥**
3. **启用 HTTPS**
4. **配置防火墙规则**
5. **定期备份数据库**
6. **监控应用日志**
7. **限制文件上传大小**
8. **实施 API 速率限制**

## Docker 部署（可选）

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY client/package*.json ./client/

# 安装依赖
RUN npm install --production
RUN cd client && npm install && npm run build

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./database.sqlite:/app/database.sqlite
      - ./server/uploads:/app/server/uploads
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

部署命令：

```bash
docker-compose up -d
```

## 联系支持

如有问题，请联系技术团队或查看项目文档。
