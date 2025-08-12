# 个人导航页面

一个优雅的个人导航页面，支持通过网页界面添加、编辑和删除书签。

## 功能特性

- 📝 通过网页界面添加网址、名称和图标
- 🎨 现代化的玻璃质感UI设计
- 🌓 支持明暗主题切换
- 📱 完全响应式设计，支持所有设备
- 💾 数据保存在本地存储中
- 🚀 一键部署到Vercel

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 部署到Vercel

### 方法一：通过Vercel CLI

1. 安装Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目目录中运行：
```bash
vercel
```

3. 跟随提示完成部署

### 方法二：通过Git连接

1. 将代码推送到GitHub仓库
2. 在Vercel网站中导入项目
3. 选择您的GitHub仓库
4. 点击部署

## 使用说明

1. 点击"添加网站"按钮来添加新的书签
2. 填写网站名称、地址和图标URL（可选）
3. 如果不提供图标，系统会自动获取网站的favicon
4. 悬停在书签上可以看到编辑和删除按钮
5. 点击右上角的月亮/太阳图标切换明暗主题

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons