# 水晶定制应用

这是与 `设计稿-v0.1` 分离的正式程序工程。当前版本提供：

- 8 步移动端 H5 主流程与响应式桌面预览
- 阳历/农历、称呼、出生时辰、性别输入状态
- 八字确认、当前大运与流年展示（当前为显式演示数据）
- 推荐手串、真实珠子图片、慢速旋转与左右滑动
- 素串/拼色自选、用户自选结果、穿戴预览与水晶簇页面
- FastAPI 本地留档接口与后台列表
- DeepSeek Provider 接口；没有配置密钥和模型时只返回开发提示，不生成伪命理结论

## 本地启动

```bash
pnpm install
pnpm dev:web
```

另开终端：

```bash
python3 -m venv services/api/.venv
services/api/.venv/bin/pip install -r services/api/requirements.txt
cp .env.example services/api/.env
services/api/.venv/bin/uvicorn app.main:app --reload --app-dir services/api --port 8000
```

API 会自动读取 `services/api/.env`。请把 DeepSeek 密钥只写入该文件；该文件已被 Git 忽略，不会提交到仓库。

后台：

```bash
pnpm dev:admin
```

- 用户端：http://127.0.0.1:3000
- 后台：http://127.0.0.1:3001
- API 文档：http://127.0.0.1:8000/docs

## 当前边界

1. 正式八字排盘引擎与业务口径尚待确认，页面中的四柱、十神、大运和流年只用于开发态 UI 联调。
2. DeepSeek 只负责基于确定性排盘事实做完整分析，不负责计算或修改四柱。
3. 穿戴效果当前是本地可交互演示层；正式 ImageGen Provider 接入后将改为后端异步任务。
4. 用户上传的露手腕照片只使用浏览器临时 URL，不上传、不持久化。
