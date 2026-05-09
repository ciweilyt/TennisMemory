# TennisMemory 🎾

网球日记 + 数据分析 + 约球管理 —— 三合一微信小程序

基于 [Taro](https://taro.zone/) 框架开发，支持微信/支付宝/抖音等多端小程序。

## 功能概览

### 📝 AI 智能记录
- 聊天式快速录入，输入自然语言即可创建比赛记录
- AI 自动解析对手、比分、场地、时长等信息
- 示例：`"昨晚和Kevin在基地打了两个小时，6:3输了，发球状态很差"`

### 📊 数据统计
- 总胜率、近10场胜率、连胜/连败统计
- 不同场地（硬地/红土/草地）胜率分析
- 单打 vs 双打胜率对比
- AI 趋势分析（抢七胜率、第二盘表现、左手选手适应等）

### 🏆 Elo / NTRP 等级系统
- 每场比赛动态 Elo 评分
- 自动映射 NTRP 等级（2.5 ~ 5.0）
- 发展趋势追踪

### 👥 网球社交图谱
- 常打球友一览
- 宿敌对战记录
- 最佳双打搭档
- Elo 排行榜

### 🧠 AI 赛后总结
- 比赛结束后自动生成专业分析
- 针对技术问题给出训练建议

### ✏️ 个人信息编辑
- 修改昵称、个性签名
- 设置偏好场地、球龄

### 🗑️ 左滑删除
- 比赛卡片支持左滑删除，带触觉反馈和弹性动画

## 技术栈

- **框架**：Taro 3 + React + TypeScript
- **样式**：SCSS + CSS Modules
- **状态管理**：Zustand
- **工具库**：classnames、dayjs

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── ChatBubble/      # 聊天气泡
│   ├── MatchCard/       # 比赛卡片（含左滑删除）
│   ├── PlayerAvatar/    # 球友头像
│   ├── RatingBadge/     # Elo 等级徽章
│   └── StatCard/        # 统计数据卡片
├── pages/
│   ├── home/            # 日记首页
│   ├── record/          # AI 录入页
│   ├── stats/           # 数据统计页
│   ├── social/          # 网球社交页
│   ├── mine/            # 个人中心页
│   ├── match-detail/    # 比赛详情页
│   └── player-profile/  # 球友档案页
├── store/               # Zustand 状态管理
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数（AI解析、Elo计算、统计）
├── data/                # Mock 数据
└── styles/              # 全局样式和变量
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 8

### 安装依赖

```bash
npm install --legacy-peer-deps
```

### 开发模式

```bash
# 微信小程序
npm run dev:weapp

# 支付宝小程序
npm run dev:alipay

# 抖音小程序
npm run dev:tt
```

### 构建

```bash
# 微信小程序
npm run build:weapp

# 支付宝小程序
npm run build:alipay

# 抖音小程序
npm run build:tt
```

### 预览

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，目录选择 `dist/`
3. AppID 可使用测试号

## 配色方案

| 用途 | 色值 |
|------|------|
| 主题色（网球场地绿） | `#1A6B4C` |
| 辅助色 | `#2D9B72` |
| 点缀色（网球荧光黄绿） | `#D4F34A` |
| 胜利色 | `#00B42A` |
| 失败色 | `#F53F3F` |

## License

MIT
