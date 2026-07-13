"""World, maps, and NPC management."""
from __future__ import annotations

from src.data_loader import load_data


class World:
    """Manages game world state."""

    def __init__(self):
        data = load_data()
        self.maps = data["maps"]
        self.npcs = data["npcs"]
        self.items = data["items"]
        self.skills = data["skills"]

    def get_location(self, location_id: str) -> dict:
        return self.maps.get(location_id, {})

    def get_location_npcs(self, location_id: str, player) -> list[dict]:
        """Return alive NPCs at a location."""
        location = self.get_location(location_id)
        npc_ids = location.get("npcs", [])
        result = []
        for npc_id in npc_ids:
            if npc_id not in player.dead_npcs:
                npc = self.npcs.get(npc_id)
                if npc:
                    result.append(npc)
        return result

    def get_npc(self, npc_id: str) -> dict | None:
        return self.npcs.get(npc_id)

    def get_item(self, item_id: str) -> dict | None:
        return self.items.get(item_id)

    def get_skill(self, skill_id: str) -> dict | None:
        return self.skills.get(skill_id)

    def move(self, player, direction: str) -> bool:
        """Try to move player in a direction. Returns True if successful."""
        location = self.get_location(player.location_id)
        connections = location.get("connections", {})
        if direction not in connections:
            return False
        player.location_id = connections[direction]
        return True

    def get_connection_name(self, location_id: str, direction: str) -> str:
        """Get the name of the connected location."""
        location = self.get_location(location_id)
        target_id = location.get("connections", {}).get(direction)
        if target_id:
            return self.get_location(target_id).get("name", "未知")
        return ""

    def get_available_directions(self, location_id: str) -> dict[str, str]:
        """Get all available directions from a location."""
        location = self.get_location(location_id)
        directions = location.get("connections", {})
        return {
            direction: self.get_location(target_id).get("name", "未知")
            for direction, target_id in directions.items()
        }
