"""Basic tests for Hero Altar."""
from src.data_loader import load_data
from src.player import Player
from src.world import World


def test_data_loads():
    data = load_data()
    assert "maps" in data
    assert "npcs" in data
    assert "skills" in data
    assert "items" in data
    assert "taiping_town_center" in data["maps"]


def test_player_creation():
    player = Player("测试侠客", "男")
    assert player.name == "测试侠客"
    assert player.gender == "男"
    assert player.hp == player.max_hp
    assert player.location_id == "taiping_town_center"


def test_world_lookup():
    world = World()
    location = world.get_location("taiping_town_center")
    assert location["name"] == "太平镇"
    npcs = world.get_location_npcs("taiping_town_center", Player("x", "男"))
    assert len(npcs) > 0


def test_save_and_load():
    player = Player("存档测试", "女")
    player.base_strength = 20
    player.add_item("healing_pill", 2)
    player.add_skill("basic_fist", 5)

    data = player.to_dict()
    loaded = Player.from_dict(data)

    assert loaded.name == player.name
    assert loaded.base_strength == 20
    assert loaded.inventory["healing_pill"] == 2
    assert loaded.skills["basic_fist"] == 5
