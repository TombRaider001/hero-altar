# Hero Altar（英雄坛说复刻）

一个致敬文曲星经典游戏《英雄坛说》的网页复刻版。

> 本项目为同人非商业复刻，采用 MIT 开源协议。  
> `assets/` 目录下的图片素材提取自原版《英雄坛说》，版权归原发行商所有，仅供学习交流。

## 在线游玩

GitHub Pages 地址（部署后填写）：

```
https://TombRaider001.github.io/hero-altar/
```

## 本地运行

直接用浏览器打开 `index.html` 即可（已打包成 `dist/game.js`，支持 `file://` 协议）。

或者启动一个本地服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 修改源码后重新打包

如果改了 `src/` 里的代码，需要重新生成 `dist/game.js`：

```bash
python build.py
```

## 操作方式

### 电脑

- `方向键` / `WASD`：移动
- `Enter` / `空格` / `Z`：确认 / 互动
- `Esc` / `Backspace` / `X`：取消 / 菜单

### 手机

- 屏幕下方有方向键和 A/B 按钮

## 游戏特色

- 像素风 Canvas 画面，模拟文曲星 LCD 点阵感
- 手机、电脑都能玩
- 本地存档（浏览器 localStorage）
- 开放武侠世界，自由探索、拜师、战斗
- NPC 永久死亡系统
- 数据驱动：地图、NPC、武功、物品全部外置为 JSON

## 当前进度

- [x] 项目骨架
- [x] Canvas 渲染与输入
- [x] 角色创建与属性系统
- [x] 基础地图与 NPC 交互
- [x] 回合制战斗
- [x] 存档/读档
- [ ] 八大门派
- [ ] 完整武功系统
- [ ] 任务系统
- [ ] 多地图世界
- [ ] 联机功能

## 项目结构

```
hero-altar/
├── index.html       # 游戏页面
├── style.css        # 样式
├── src/             # 源码
│   ├── main.js      # 入口
│   ├── game.js      # 游戏主逻辑
│   ├── renderer.js  # Canvas 渲染
│   ├── input.js     # 键盘/触摸输入
│   ├── player.js    # 玩家数据
│   ├── world.js     # 地图/NPC
│   ├── combat.js    # 战斗
│   ├── ui.js        # HTML 覆盖层
│   ├── storage.js   # 本地存档
│   ├── utils.js     # 工具函数
│   └── data/        # 游戏数据 JSON
├── assets/          # 图片素材（详见 assets/ASSETS.md）
├── data/            # 原始数据（与 src/data 同步）
├── archive/         # 旧版本归档
└── LICENSE
```

## 开源协议

MIT License
