"""Main game logic and loops."""
import json
import os
import random
from pathlib import Path

from src import ui
from src.combat import start_combat
from src.data_loader import load_data
from src.player import Player
from src.world import World


class Game:
    """Main game controller."""

    SAVE_DIR = Path(__file__).resolve().parent.parent / "saves"

    def __init__(self):
        self.world = World()
        self.player: Player | None = None

    def run(self):
        """Main entry loop."""
        while True:
            ui.clear()
            ui.print_header("英雄坛说 · Hero Altar")
            ui.boxed_text([
                "一个致敬文曲星经典武侠 RPG 的复刻作品",
                "黑白终端 · 开放江湖 · 自由探索",
            ])

            choice = ui.show_menu("主菜单", [
                ("new", "新的开始"),
                ("load", "载入存档"),
                ("quit", "退出游戏"),
            ])

            if choice == "new":
                self.new_game()
            elif choice == "load":
                self.load_game()
            elif choice == "quit" or choice == "":
                ui.exit_game()

    def new_game(self):
        """Create a new character and start the game."""
        ui.clear()
        ui.print_header("创建角色")

        name = ui.get_choice("请输入你的名字: ")
        if not name:
            name = "无名侠客"

        gender_choice = ui.show_menu("选择性别", [
            ("male", "男"),
            ("female", "女"),
        ])
        gender = "男" if gender_choice == "male" else "女"

        self.player = Player(name, gender)

        ui.print_line(f"\n欢迎来到江湖，{name}。")
        ui.print_line("你有 80 点天赋点数，请分配到四项属性上。")
        ui.print_line("【膂力】影响攻击力  【敏捷】影响速度和闪避")
        ui.print_line("【悟性】影响内力    【根骨】影响气血和防御")
        ui.pause()

        self._allocate_stats()
        self.player._recalculate_stats()
        self.player.hp = self.player.max_hp
        self.player.mp = self.player.max_mp

        # Starting items
        self.player.add_item("cloth_clothes", 1)
        self.player.add_item("steamed_bun", 3)

        ui.print_line("\n你出生在太平镇，一段江湖传奇就此展开……")
        ui.pause()
        self.main_loop()

    def _allocate_stats(self):
        """Interactive stat allocation."""
        points = 80
        stats = {
            "strength": ("膂力", 15),
            "agility": ("敏捷", 15),
            "intelligence": ("悟性", 15),
            "constitution": ("根骨", 15),
        }

        while points > 0:
            ui.clear()
            ui.print_header("分配天赋")
            ui.print_line(f"剩余点数: {points}\n")
            for key, (name, value) in stats.items():
                ui.print_line(f"  {name}: {value}")
            ui.print_line()

            options = [
                ("strength", f"膂力 ({stats['strength'][1]})"),
                ("agility", f"敏捷 ({stats['agility'][1]})"),
                ("intelligence", f"悟性 ({stats['intelligence'][1]})"),
                ("constitution", f"根骨 ({stats['constitution'][1]})"),
            ]
            stat_key = ui.show_menu("选择要增加的属性", options)
            if not stat_key:
                break

            amount_str = ui.get_choice("增加多少点？")
            try:
                amount = int(amount_str)
                if amount <= 0 or amount > points:
                    ui.print_line("点数不足或输入无效。")
                    ui.pause()
                    continue
                name, current = stats[stat_key]
                stats[stat_key] = (name, current + amount)
                points -= amount
            except ValueError:
                ui.print_line("请输入数字。")
                ui.pause()

        self.player.base_strength = stats["strength"][1]
        self.player.base_agility = stats["agility"][1]
        self.player.base_intelligence = stats["intelligence"][1]
        self.player.base_constitution = stats["constitution"][1]

    def load_game(self):
        """Load a saved game."""
        saves = self._list_saves()
        if not saves:
            ui.print_line("没有可用的存档。")
            ui.pause()
            return

        options = [(s, s) for s in saves]
        save_name = ui.show_menu("选择存档", options)
        if not save_name:
            return

        save_path = self.SAVE_DIR / save_name
        try:
            with open(save_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.player = Player.from_dict(data)
            ui.print_line(f"\n欢迎回来，{self.player.name}！")
            ui.pause()
            self.main_loop()
        except Exception as e:
            ui.print_line(f"读档失败：{e}")
            ui.pause()

    def save_game(self):
        """Save current game."""
        if not self.player:
            return

        os.makedirs(self.SAVE_DIR, exist_ok=True)
        save_name = f"{self.player.name}.json"
        save_path = self.SAVE_DIR / save_name

        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(self.player.to_dict(), f, ensure_ascii=False, indent=2)

        ui.print_line(f"\n已保存到 {save_name}")
        ui.pause()

    def _list_saves(self) -> list[str]:
        """List available save files."""
        if not self.SAVE_DIR.exists():
            return []
        return sorted([f.name for f in self.SAVE_DIR.glob("*.json")])

    def main_loop(self):
        """Main gameplay loop."""
        while self.player and self.player.is_alive():
            ui.clear()
            self._show_status_bar()
            self._explore_location()

    def _show_status_bar(self):
        """Show persistent status bar."""
        loc = self.world.get_location(self.player.location_id)
        location_name = loc.get("name", "未知之地")
        print(
            f"[{self.player.name}] Lv.{self.player.level}  "
            f"HP:{self.player.hp}/{self.player.max_hp}  "
            f"MP:{self.player.mp}/{self.player.max_mp}  "
            f"所在地:{location_name}  "
            f"善恶:{self.player.morality}"
        )
        print("-" * 50)

    def _explore_location(self):
        """Show location and available actions."""
        location = self.world.get_location(self.player.location_id)
        ui.print_header(location.get("name", "未知之地"))
        ui.print_line(location.get("description", ""))
        ui.print_line()

        # Show NPCs
        npcs = self.world.get_location_npcs(self.player.location_id, self.player)
        if npcs:
            ui.print_line("这里的人：" + "、".join(npc["name"] for npc in npcs))

        # Show exits
        directions = self.world.get_available_directions(self.player.location_id)
        if directions:
            direction_names = {
                "north": "北", "south": "南", "east": "东", "west": "西",
                "northeast": "东北", "northwest": "西北",
                "southeast": "东南", "southwest": "西南",
                "up": "上", "down": "下"
            }
            exits = [f"{direction_names.get(d, d)}-{name}" for d, name in directions.items()]
            ui.print_line("出口：" + " ".join(exits))

        ui.print_line()

        options = [
            ("move", "移动"),
            ("npc", "与 NPC 互动"),
            ("status", "查看状态"),
            ("inventory", "打开背包"),
            ("skill", "武功"),
            ("save", "保存游戏"),
            ("quit", "返回主菜单"),
        ]
        choice = ui.show_menu("行动", options)

        if choice == "move":
            self._handle_move()
        elif choice == "npc":
            self._handle_npc()
        elif choice == "status":
            self._show_status()
        elif choice == "inventory":
            self._handle_inventory()
        elif choice == "skill":
            self._handle_skills()
        elif choice == "save":
            self.save_game()
        elif choice == "quit" or choice == "":
            if ui.confirm("确定要返回主菜单吗？未保存的进度会丢失。"):
                return

    def _handle_move(self):
        """Handle movement."""
        directions = self.world.get_available_directions(self.player.location_id)
        if not directions:
            ui.print_line("这里无路可走。")
            ui.pause()
            return

        direction_names = {
            "north": "北", "south": "南", "east": "东", "west": "西",
            "northeast": "东北", "northwest": "西北",
            "southeast": "东南", "southwest": "西南",
            "up": "上", "down": "下"
        }
        options = [(d, f"{direction_names.get(d, d)} - {name}") for d, name in directions.items()]
        direction = ui.show_menu("选择方向", options)
        if direction:
            self.world.move(self.player, direction)

    def _handle_npc(self):
        """Handle NPC interaction."""
        npcs = self.world.get_location_npcs(self.player.location_id, self.player)
        if not npcs:
            ui.print_line("这里没有人。")
            ui.pause()
            return

        options = [(npc["id"], npc["name"]) for npc in npcs]
        npc_id = ui.show_menu("选择 NPC", options)
        if not npc_id:
            return

        npc = self.world.get_npc(npc_id)
        self._interact_with_npc(npc)

    def _interact_with_npc(self, npc: dict):
        """Show interaction options for a specific NPC."""
        ui.clear()
        ui.print_header(npc.get("name", "陌生人"))
        ui.print_line(f"[{npc.get('title', '')}]")
        ui.print_line()

        # Check if NPC has a quest
        quest = npc.get("quest")
        if quest and quest["id"] not in self.player.quests_completed:
            # Check if player has required item
            required_item = quest.get("required_item")
            if required_item and self.player.has_item(required_item):
                item_name = self.world.get_item(required_item).get("name", required_item)
                ui.print_line(f"{npc['name']}：{npc.get('dialog_quest_done', '谢谢你！')}")
                if ui.confirm(f"交出 {item_name} 吗？"):
                    self.player.remove_item(required_item, 1)
                    self.player.quests_completed.add(quest["id"])
                    self.player.gain_exp(quest.get("reward_exp", 0))
                    self.player.gold += quest.get("reward_gold", 0)
                    reward_item = quest.get("reward_item")
                    if reward_item:
                        self.player.add_item(reward_item, 1)
                        item_name = self.world.get_item(reward_item).get("name", reward_item)
                        ui.print_line(f"获得 {item_name}！")
                    ui.print_line(f"获得 {quest.get('reward_exp', 0)} 经验，{quest.get('reward_gold', 0)} 文钱。")
                    ui.pause()
                    return
            else:
                ui.print_line(f"{npc['name']}：{npc.get('dialog_default', '……')}")
        else:
            ui.print_line(f"{npc['name']}：{npc.get('dialog_default', '……')}")

        ui.print_line()

        options = [("talk", "交谈")]
        if npc.get("hostile"):
            options.append(("attack", "攻击"))
        if npc.get("shop"):
            options.append(("shop", "交易"))
        if "inn" in npc.get("services", []):
            options.append(("rest", "住店休息"))
        if "teach" in npc.get("services", []):
            options.append(("learn", "请教武功"))

        choice = ui.show_menu("互动", options)

        if choice == "attack":
            start_combat(self.player, npc, self.world)
        elif choice == "shop":
            self._handle_shop(npc)
        elif choice == "rest":
            self._handle_rest(npc)
        elif choice == "learn":
            self._handle_learn(npc)

    def _handle_shop(self, npc: dict):
        """Handle trading with an NPC."""
        shop_items = npc.get("shop", [])
        if not shop_items:
            return

        options = []
        for entry in shop_items:
            item = self.world.get_item(entry["item_id"])
            if item and entry.get("quantity", 0) > 0:
                options.append((entry["item_id"], f"{item['name']} - {entry['price']} 文"))

        if not options:
            ui.print_line("暂时没有货物。")
            ui.pause()
            return

        item_id = ui.show_menu("购买", options)
        if not item_id:
            return

        for entry in shop_items:
            if entry["item_id"] == item_id:
                price = entry["price"]
                if self.player.gold < price:
                    ui.print_line("你的钱不够。")
                else:
                    self.player.gold -= price
                    self.player.add_item(item_id, 1)
                    entry["quantity"] -= 1
                    item_name = self.world.get_item(item_id).get("name", item_id)
                    ui.print_line(f"购买了 {item_name}，花费 {price} 文。")
                ui.pause()
                return

    def _handle_rest(self, npc: dict):
        """Rest at an inn."""
        price = npc.get("inn_price", 50)
        if self.player.gold < price:
            ui.print_line("你的钱不够住店。")
            ui.pause()
            return
        if ui.confirm(f"住店一晚 {price} 文，恢复全部气血内力，确定吗？"):
            self.player.gold -= price
            self.player.heal(hp=self.player.max_hp, mp=self.player.max_mp)
            ui.print_line("你睡了个好觉，精神焕发。")
            ui.pause()

    def _handle_learn(self, npc: dict):
        """Learn skills from an NPC."""
        teachable = npc.get("teachable_skills", [])
        if not teachable:
            ui.print_line("这里没有可学的武功。")
            ui.pause()
            return

        options = []
        for entry in teachable:
            skill = self.world.get_skill(entry["skill_id"])
            if skill:
                options.append((
                    entry["skill_id"],
                    f"{skill['name']} - {entry['cost_gold']} 文 / {entry['cost_potential']} 潜能"
                ))

        skill_id = ui.show_menu("请教武功", options)
        if not skill_id:
            return

        for entry in teachable:
            if entry["skill_id"] == skill_id:
                if self.player.gold < entry["cost_gold"]:
                    ui.print_line("你的钱不够。")
                elif self.player.potential < entry["cost_potential"]:
                    ui.print_line("你的潜能不足，多去做任务或战斗积累。")
                else:
                    self.player.gold -= entry["cost_gold"]
                    self.player.potential -= entry["cost_potential"]
                    self.player.add_skill(skill_id, 1)
                    skill_name = self.world.get_skill(skill_id).get("name", skill_id)
                    ui.print_line(f"你学会了 {skill_name}！")
                ui.pause()
                return

    def _show_status(self):
        """Show detailed player status."""
        ui.clear()
        ui.print_header("角色状态")
        ui.print_line(f"姓名：{self.player.name}")
        ui.print_line(f"性别：{self.player.gender}")
        ui.print_line(f"等级：{self.player.level}（经验 {self.player.exp}/{self.player.exp_to_next}）")
        ui.print_line()
        ui.print_line(f"膂力：{self.player.base_strength}  敏捷：{self.player.base_agility}")
        ui.print_line(f"悟性：{self.player.base_intelligence}  根骨：{self.player.base_constitution}")
        ui.print_line()
        ui.print_line(f"气血：{self.player.hp}/{self.player.max_hp}")
        ui.print_line(f"内力：{self.player.mp}/{self.player.max_mp}")
        ui.print_line(f"攻击：{self.player.total_attack()}  防御：{int(self.player.total_defense())}  速度：{int(self.player.speed)}")
        ui.print_line()
        ui.print_line(f"金钱：{self.player.gold} 文")
        ui.print_line(f"潜能：{self.player.potential}")
        ui.print_line(f"善恶值：{self.player.morality}")
        ui.pause()

    def _handle_inventory(self):
        """Show and use inventory."""
        ui.clear()
        ui.print_header("背包")
        if not self.player.inventory:
            ui.print_line("背包空空如也。")
            ui.pause()
            return

        items = load_data()["items"]
        options = []
        for item_id, qty in self.player.inventory.items():
            item = items.get(item_id, {})
            options.append((item_id, f"{item.get('name', item_id)} x{qty}"))

        item_id = ui.show_menu("选择物品", options)
        if not item_id:
            return

        item = items.get(item_id, {})
        ui.print_line(f"\n{item.get('name', item_id)}")
        ui.print_line(item.get("description", ""))

        if item.get("type") == "consumable":
            if ui.confirm("使用这个物品？"):
                effect = item.get("effect", {})
                if effect.get("type") == "heal_hp":
                    self.player.heal(hp=effect.get("value", 0))
                    ui.print_line(f"恢复 {effect.get('value', 0)} 点气血。")
                elif effect.get("type") == "heal_mp":
                    self.player.heal(mp=effect.get("value", 0))
                    ui.print_line(f"恢复 {effect.get('value', 0)} 点内力。")
                self.player.remove_item(item_id, 1)
                ui.pause()
        elif item.get("type") == "weapon":
            if ui.confirm("装备这个武器？"):
                self.player.equipped_weapon = item_id
                self.player._recalculate_stats()
                ui.print_line(f"装备了 {item.get('name')}。")
                ui.pause()
        elif item.get("type") == "armor":
            if ui.confirm("装备这件防具？"):
                slot = item.get("slot", "body")
                self.player.equipped_armor[slot] = item_id
                self.player._recalculate_stats()
                ui.print_line(f"装备了 {item.get('name')}。")
                ui.pause()

    def _handle_skills(self):
        """Show learned skills."""
        ui.clear()
        ui.print_header("武功")
        if not self.player.skills:
            ui.print_line("你还没有学会任何武功。")
            ui.pause()
            return

        for skill_id, level in self.player.skills.items():
            skill = self.world.get_skill(skill_id)
            if skill:
                ui.print_line(f"  {skill['name']} Lv.{level}  [{skill['type']}]")
                ui.print_line(f"    {skill['description']}")
        ui.pause()
