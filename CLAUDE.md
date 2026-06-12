# CatLookMiniApp — 猫录助手微信小程序

## 项目信息

- **GitHub**: https://github.com/betelunt/CatLookMiniApp
- **AppID**: wx28bfc44bb31bd451
- **本地路径**: D:\微信web开发者工具\catlook
- **Git 工作区**: C:\Users\arlen\Projects\CatLookMiniApp

## 技术栈

- 微信原生小程序 (WXML + WXSS + JS)
- Supabase REST API (MemFire 实例)
- Node.js 云函数

## Supabase 配置

- URL: https://d5msiv8g91huch72eu20.baseapi.memfiredb.com
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzM0NTYwMjY4NSwiaWF0IjoxNzY4ODAyNjg1LCJpc3MiOiJzdXBhYmFzZSJ9.GDhwj8464VwuX2hOoqbiPpn2er4X9Ytlt2LdqRSUDAo

## 用户信息

- 用户: Sam (betelunt) — 猫录 App 开发者，Mac 环境
- 协作: 福福 — 猫录小程序开发者，Windows 环境
- 猫录 App 仓库: https://github.com/betelunt/catlook

## 开发注意事项

- **每次代码变动后自动 commit + push 到 GitHub**（保持与 Sam 同频，无需提醒）
- 提交前确认 DEV_MODE 状态
- 图片上传使用压缩模式
- 注意 MemFire 流量限制 (4GB/月)
- 双端共享同一 Supabase 实例，注意 RLS 策略
- ⚠️ 生产环境：禁止 DELETE / 禁止修改已有用户数据 / 改表结构先确认
