"""Turn-based combat system."""
import random

from src import ui
from src.data_loader import load_data
from src.player import Player
from src.world import World


def calculate_damage(attacker_attack: int, defender_defense: int, speed: int) -> int:
    """Calculate combat damage."""
    base = max(1, attacker_attack - defender_defense * 0.5)
    variance = random.uniform(0.9, 1.1)
    crit_chance = speed * 0.005
    crit = random.random() < crit_chance
    damage = int(base * variance * (2 if crit else 1))
    return max(1, damage), crit


def start_combat(player: Player, npc: dict, world: World):
    """Start a combat encounter. Returns True if player wins."""
    npc_data = npc.get("combat", {})
    npc_hp = npc_data.get("hp", 50)
    npc_max_hp = npc_hp
    npc_mp = npc_data.get("mp", 0)
    npc_attack = npc_data.get("attack", 10)
    npc_defense = npc_data.get("defense", 5)
    npc_speed = npc_data.get("speed", 10)
    npc_name = npc.get("name", "敌人")

    ui.clear()
    ui.print_header("战斗开始")
    print(f"你对 {npc_name} 发起了攻击！\n")

    while player.is_alive() and npc_hp > 0:
        ui.print_line(f"【{player.name}】 HP: {player.hp}/{player.max_hp}  MP: {player.mp}/{player.max_mp}")
        ui.print_line(f"【{npc_name}】   HP: {npc_hp}/{npc_max_hp}\n")

        choice = ui.show_menu("战斗", [
            ("attack", "攻击"),
            ("skill", "使用武功"),
            ("item", "使用物品"),
            ("flee", "逃跑"),
        ])

        if choice == "":
            continue

        if choice == "flee":
            flee_chance = 0.3 + (player.speed - npc_speed) * 0.02
            if random.random() < flee_chance:
                ui.print_line("\n你趁机逃走了！")
                ui.pause()
                return False
            else:
                ui.print_line("\n逃跑失败！")

        elif choice == "attack":
            damage, crit = calculate_damage(player.total_attack(), npc_defense, player.speed)
            npc_hp -= damage
            msg = f"你攻击 {npc_name}，造成 {damage} 点伤害"
            if crit:
                msg += "（暴击！）"
            ui.print_line(msg)

        elif choice == "skill":
            if not player.skills:
                ui.print_line("你还没有学会任何武功。")
                continue
            skill_options = []
            for skill_id, level in player.skills.items():
                skill = world.get_skill(skill_id)
                if skill:
                    skill_options.append((skill_id, f"{skill['name']} Lv.{level}"))
            skill_id = ui.show_menu("选择武功", skill_options)
            if not skill_id:
                continue
            skill = world.get_skill(skill_id)
            damage, crit = calculate_damage(
                player.total_attack() + player.skills[skill_id] * 2,
                npc_defense,
                player.speed
            )
            npc_hp -= damage
            ui.print_line(f"你使出 {skill['name']}，造成 {damage} 点伤害！")

        elif choice == "item":
            if not player.inventory:
                ui.print_line("背包空空如也。")
                continue
            item_options = []
            for item_id, qty in player.inventory.items():
                item = world.get_item(item_id)
                if item and item["type"] == "consumable":
                    item_options.append((item_id, f"{item['name']} x{qty}"))
            if not item_options:
                ui.print_line("没有可使用的物品。")
                continue
            item_id = ui.show_menu("使用物品", item_options)
            if not item_id:
                continue
            item = world.get_item(item_id)
            effect = item.get("effect", {})
            if effect.get("type") == "heal_hp":
                player.heal(hp=effect.get("value", 0))
                ui.print_line(f"使用了 {item['name']}，恢复 {effect.get('value', 0)} 点气血。")
            elif effect.get("type") == "heal_mp":
                player.heal(mp=effect.get("value", 0))
                ui.print_line(f"使用了 {item['name']}，恢复 {effect.get('value', 0)} 点内力。")
            player.remove_item(item_id, 1)

        # NPC turn
        if npc_hp > 0:
            damage, crit = calculate_damage(npc_attack, player.total_defense(), npc_speed)
            player.hp -= damage
            msg = f"{npc_name} 攻击你，造成 {damage} 点伤害"
            if crit:
                msg += "（暴击！）"
            ui.print_line(msg)

        ui.print_line()

    ui.pause()

    if not player.is_alive():
        ui.print_line("\n你重伤倒地……")
        ui.print_line("一位路过的侠客把你抬回了镇上。")
        player.hp = 1
        player.location_id = "taiping_town_center"
        ui.pause()
        return False

    if npc_hp <= 0:
        ui.print_line(f"\n你击败了 {npc_name}！")
        exp_gain = npc_data.get("level", 1) * 20 + 10
        gold_gain = 0
        player.gain_exp(exp_gain)
        ui.print_line(f"获得 {exp_gain} 点经验。")

        # Loot
        loot_list = npc_data.get("loot", [])
        items = load_data()["items"]
        for loot in loot_list:
            item_id = loot["item_id"]
            chance = loot.get("chance", 1.0)
            quantity = loot.get("quantity", 1)
            if random.random() < chance:
                player.add_item(item_id, quantity)
                item_name = items.get(item_id, {}).get("name", item_id)
                ui.print_line(f"获得：{item_name} x{quantity}")
                if items.get(item_id, {}).get("type") == "currency":
                    gold_gain += quantity

        if gold_gain > 0:
            ui.print_line(f"获得 {gold_gain} 文铜钱。")

        # Morality choice
        if ui.confirm(f"{npc_name} 倒在地上，要杀死他吗？"):
            player.dead_npcs.add(npc["id"])
            player.morality -= 5
            ui.print_line(f"你杀死了 {npc_name}，善恶值下降。")
        else:
            player.morality += 1
            ui.print_line(f"你放过了 {npc_name}，善恶值上升。")

        ui.pause()
        return True

    return False
