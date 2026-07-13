# Hero Altar（英雄坛说复刻）

一个致敬文曲星经典游戏《英雄坛说》的 Python 终端复刻版。

> 本项目为同人非商业复刻，所有原创内容采用宽松的开源协议发布。

## 运行方式

需要 Python 3.8+（[下载 Python](https://www.python.org/downloads/)）。

### Windows（最简单）

1. 把仓库 clone 到本地：
   ```bash
   git clone git@github.com:TombRaider001/hero-altar.git
   ```
2. 双击文件夹里的 **`start.bat`** 即可开始游戏。

### macOS / Linux

```bash
cd hero-altar
./start.sh
```

### 命令行方式

```bash
cd hero-altar
python -m src.main
```

如果中文显示乱码，先执行 `set PYTHONIOENCODING=utf-8`（Windows）或 `export PYTHONIOENCODING=utf-8`（macOS/Linux）。

## 游戏特色

- 终端文字界面，还原黑白点阵怀旧感
- 开放武侠世界，自由探索、拜师、战斗
- NPC 永久死亡系统
- 善恶值与通缉机制
- 数据驱动：地图、NPC、武功、物品全部外置为 JSON

## 当前进度

- [x] 项目骨架
- [x] 角色创建与属性系统
- [x] 基础地图与 NPC 交互
- [x] 回合制战斗
- [x] 存档/读档
- [ ] 八大门派
- [ ] 完整武功系统
- [ ] 任务系统
- [ ] 多地图世界

## 项目结构

```
hero-altar/
├── src/            # 源码
├── data/           # 游戏数据（地图、NPC、武功、物品）
├── saves/          # 存档目录
└── tests/          # 测试
```

## 开源协议

MIT License
