#!/bin/bash

echo "启动文档与项目管理平台..."

# 启动后端服务器
echo "正在启动后端服务器（端口 3000）..."
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端开发服务器
echo "正在启动前端开发服务器（端口 5173）..."
cd client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "平台已启动！"
echo "================================"
echo "后端 API: http://localhost:3000/api"
echo "前端界面: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 等待用户中断
wait
