"""Player character data and logic."""
from __future__ import annotations


class Player:
    """Represents the player character."""

    def __init__(self, name: str, gender: str):
        self.name = name
        self.gender = gender

        # Base stats (range roughly 10-30 at creation)
        self.base_strength = 15
        self.base_agility = 15
        self.base_intelligence = 15
        self.base_constitution = 15

        # Progression
        self.level = 1
        self.exp = 0
        self.exp_to_next = 100
        self.potential = 0
        self.gold = 100

        # State
        self.hp = 0
        self.max_hp = 0
        self.mp = 0
        self.max_mp = 0
        self.location_id = "taiping_town_center"
        self.morality = 0  # positive = good, negative = evil

        # Skills: skill_id -> level
        self.skills: dict[str, int] = {}

        # Inventory: item_id -> quantity
        self.inventory: dict[str, int] = {}

        # Equipment
        self.equipped_weapon: str | None = None
        self.equipped_armor: dict[str, str | None] = {
            "body": None,
            "feet": None,
        }

        # Quest progress
        self.quests_completed: set[str] = set()
        self.active_quest: str | None = None

        # Dead NPCs (permanent death)
        self.dead_npcs: set[str] = set()

        self._recalculate_stats()
        self.hp = self.max_hp
        self.mp = self.max_mp

    def _recalculate_stats(self):
        """Recalculate derived stats from base stats and equipment."""
        self.max_hp = 50 + self.base_constitution * 5 + self.level * 10
        self.max_mp = 20 + self.base_intelligence * 3 + self.level * 5

        self.attack = self.base_strength * 1 + self.level * 1
        self.defense = self.base_constitution * 0.5 + self.level * 0.5
        self.speed = self.base_agility * 1 + self.level * 0.5

        # Equipment bonuses
        if self.equipped_weapon:
            from src.data_loader import load_data
            items = load_data()["items"]
            weapon = items.get(self.equipped_weapon, {})
            effect = weapon.get("effect", {})
            self.attack += effect.get("attack", 0)

        for slot, item_id in self.equipped_armor.items():
            if item_id:
                from src.data_loader import load_data
                items = load_data()["items"]
                armor = items.get(item_id, {})
                effect = armor.get("effect", {})
                self.attack += effect.get("attack", 0)
                self.defense += effect.get("defense", 0)
                self.speed += effect.get("speed", 0)

    def total_attack(self) -> int:
        """Return total attack power including skills."""
        bonus = 0
        for skill_id, level in self.skills.items():
            from src.data_loader import load_data
            skills = load_data()["skills"]
            skill = skills.get(skill_id, {})
            if skill.get("type") in ("unarmed", "sword", "blade"):
                bonus += level * skill.get("power_per_level", 1.0)
        return int(self.attack + bonus)

    def total_defense(self) -> int:
        """Return total defense."""
        bonus = 0
        for skill_id, level in self.skills.items():
            from src.data_loader import load_data
            skills = load_data()["skills"]
            skill = skills.get(skill_id, {})
            if skill.get("type") in ("parry", "internal"):
                bonus += level * skill.get("power_per_level", 1.0) * 0.5
        return int(self.defense + bonus)

    def heal(self, hp: int = 0, mp: int = 0):
        """Restore HP/MP without exceeding max."""
        self.hp = min(self.max_hp, self.hp + hp)
        self.mp = min(self.max_mp, self.mp + mp)

    def is_alive(self) -> bool:
        return self.hp > 0

    def gain_exp(self, amount: int):
        """Gain experience and level up if threshold reached."""
        self.exp += amount
        while self.exp >= self.exp_to_next:
            self.exp -= self.exp_to_next
            self.level += 1
            self.exp_to_next = int(self.exp_to_next * 1.2)
            self._recalculate_stats()
            self.hp = self.max_hp
            self.mp = self.max_mp

    def add_item(self, item_id: str, quantity: int = 1):
        """Add item to inventory."""
        if quantity <= 0:
            return
        self.inventory[item_id] = self.inventory.get(item_id, 0) + quantity

    def remove_item(self, item_id: str, quantity: int = 1) -> bool:
        """Remove item from inventory. Returns True if successful."""
        if self.inventory.get(item_id, 0) < quantity:
            return False
        self.inventory[item_id] -= quantity
        if self.inventory[item_id] == 0:
            del self.inventory[item_id]
        return True

    def has_item(self, item_id: str, quantity: int = 1) -> bool:
        return self.inventory.get(item_id, 0) >= quantity

    def add_skill(self, skill_id: str, level: int = 1):
        """Learn or level up a skill."""
        current = self.skills.get(skill_id, 0)
        self.skills[skill_id] = max(current, level)

    def to_dict(self) -> dict:
        """Serialize player to dict."""
        return {
            "name": self.name,
            "gender": self.gender,
            "base_strength": self.base_strength,
            "base_agility": self.base_agility,
            "base_intelligence": self.base_intelligence,
            "base_constitution": self.base_constitution,
            "level": self.level,
            "exp": self.exp,
            "exp_to_next": self.exp_to_next,
            "potential": self.potential,
            "gold": self.gold,
            "hp": self.hp,
            "max_hp": self.max_hp,
            "mp": self.mp,
            "max_mp": self.max_mp,
            "location_id": self.location_id,
            "morality": self.morality,
            "skills": self.skills,
            "inventory": self.inventory,
            "equipped_weapon": self.equipped_weapon,
            "equipped_armor": self.equipped_armor,
            "quests_completed": list(self.quests_completed),
            "active_quest": self.active_quest,
            "dead_npcs": list(self.dead_npcs),
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Player":
        """Deserialize player from dict."""
        player = cls(data["name"], data["gender"])
        player.base_strength = data["base_strength"]
        player.base_agility = data["base_agility"]
        player.base_intelligence = data["base_intelligence"]
        player.base_constitution = data["base_constitution"]
        player.level = data["level"]
        player.exp = data["exp"]
        player.exp_to_next = data["exp_to_next"]
        player.potential = data["potential"]
        player.gold = data["gold"]
        player.hp = data["hp"]
        player.max_hp = data["max_hp"]
        player.mp = data["mp"]
        player.max_mp = data["max_mp"]
        player.location_id = data["location_id"]
        player.morality = data["morality"]
        player.skills = data["skills"]
        player.inventory = data["inventory"]
        player.equipped_weapon = data["equipped_weapon"]
        player.equipped_armor = data["equipped_armor"]
        player.quests_completed = set(data["quests_completed"])
        player.active_quest = data["active_quest"]
        player.dead_npcs = set(data["dead_npcs"])
        player._recalculate_stats()
        return player
