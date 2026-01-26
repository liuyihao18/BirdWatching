# 观鸟项目

AI Vibe Coding。

## 功能概览
- 登录支持“用户名或邮箱”，用户名唯一
- 上传图片自动生成缩略图，画廊等列表使用缩略图节省带宽
- 上传页支持地图选点与粗略搜索，自动回填地点
- 删除照片带自定义二次确认弹窗
- 照片详情点击图片可进入全屏查看（支持缩放）

## 启动方式

### Docker 一键启动
1. 复制环境变量文件并修改：
   - 新建 `.env`（可参考下方模板）
2. 执行：
   - `docker compose up -d --build`
3. 访问：`http://localhost`

`.env` 示例：
```
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=bird
MYSQL_USER=bird_user
MYSQL_PASSWORD=bird_pass
JWT_SECRET=please-change
ADMIN_EMAIL=admin@bird.local
ADMIN_PASSWORD=ChangeMe123!
ADMIN_NAME=管理员
```

### 本地开发（可选）
- 后端：
  - `cd backend`
  - `npm install`
  - `npm run dev`
- 前端：
  - `cd frontend`
  - 复制 `.env.example` 为 `.env` 并填写百度地图 Key（可选）
  - `npm install`
  - `npm run dev`
  - 访问 `http://localhost:3000`

## 百度地图集成说明（参考）
- 申请百度地图 Web API Key：
  - https://lbsyun.baidu.com/
- 推荐使用 JS API 方式加载：
  - https://lbsyun.baidu.com/index.php?title=jspopularGL
- 可在前端 `HomeView` 的地图容器中加载地图与选点控件，并通过 `stats/points` 接口展示打点。

## 缩略图说明
- 上传后自动生成缩略图并存放在 `/uploads/thumbs`
- 列表使用 `image_thumb_path`，详情页仍使用原图

## 维护脚本
- 生成缺失缩略图：
  - `cd backend`
  - `npm run maintenance`
- 生成缩略图并清理无关联文件：
  - `npm run maintenance -- --clean-orphans`

## 前端环境变量
- `VITE_API_BASE`：后端 API 地址，Docker 下默认 `/api`
- `VITE_BAIDU_MAP_KEY`：百度地图 Key

## 默认管理员
- 启动时会自动创建管理员账号（若不存在）
- 账号信息来自 `.env` 中 `ADMIN_EMAIL / ADMIN_PASSWORD`
