/** Embedded game data (auto-generated from JSON files). */

export const maps = {
  "taiping_town_center": {
    "id": "taiping_town_center",
    "name": "太平镇",
    "description": "一座宁静的小镇，青石板路两旁是低矮的民居。",
    "connections": {
      "east": "taiping_east_suburb",
      "west": "taiping_west_suburb",
      "north": "taiping_inn",
      "south": "taiping_dojo"
    },
    "npcs": [
      "old_lady",
      "village_chief",
      "thug_a"
    ]
  },
  "taiping_inn": {
    "id": "taiping_inn",
    "name": "悦来客栈",
    "description": "镇上唯一的客栈，门口挂着褪色的酒旗。",
    "connections": {
      "south": "taiping_town_center"
    },
    "npcs": [
      "waiter"
    ]
  },
  "taiping_dojo": {
    "id": "taiping_dojo",
    "name": "振威武馆",
    "description": "武馆里传来呼喝声，几个弟子正在练功。",
    "connections": {
      "north": "taiping_town_center"
    },
    "npcs": [
      "master_li"
    ]
  },
  "taiping_east_suburb": {
    "id": "taiping_east_suburb",
    "name": "镇东郊",
    "description": "一片荒地，偶有野狗出没。",
    "connections": {
      "west": "taiping_town_center"
    },
    "npcs": [
      "thug_b"
    ]
  },
  "taiping_west_suburb": {
    "id": "taiping_west_suburb",
    "name": "镇西郊",
    "description": "西边是一片小树林，听说有强盗出没。",
    "connections": {
      "east": "taiping_town_center"
    },
    "npcs": [
      "bandit"
    ]
  }
};

export const npcs = {
  "old_lady": {
    "id": "old_lady",
    "name": "王婆婆",
    "title": "孤寡老人",
    "location": "taiping_town_center",
    "dialog_default": "年轻人，老婆子我腿脚不便，你能帮我找根拐杖吗？镇西郊的树林里应该有。",
    "dialog_quest_done": "好孩子，这是给你的谢礼。",
    "hostile": false,
    "combat": null,
    "shop": null,
    "services": [
      "quest"
    ],
    "quest": {
      "id": "find_walking_stick",
      "name": "寻找拐杖",
      "required_item": "walking_stick",
      "reward_exp": 50,
      "reward_item": "gold_coin",
      "reward_gold": 100
    }
  },
  "village_chief": {
    "id": "village_chief",
    "name": "老村长",
    "title": "太平村村长",
    "location": "taiping_town_center",
    "dialog_default": "年轻人，想学武可以去北边的武馆看看。想出人头地，还得靠真本事啊。",
    "hostile": false,
    "combat": null,
    "shop": null,
    "services": []
  },
  "waiter": {
    "id": "waiter",
    "name": "店小二",
    "title": "客栈伙计",
    "location": "taiping_inn",
    "dialog_default": "客官，打尖还是住店？住店一晚五十文，能恢复体力。",
    "hostile": false,
    "combat": null,
    "shop": [
      {
        "item_id": "steamed_bun",
        "price": 10,
        "quantity": 999
      },
      {
        "item_id": "wine",
        "price": 50,
        "quantity": 20
      }
    ],
    "services": [
      "inn"
    ],
    "inn_price": 50
  },
  "master_li": {
    "id": "master_li",
    "name": "李教头",
    "title": "武馆教头",
    "location": "taiping_dojo",
    "dialog_default": "想学武？先把基本功练扎实！给我一百文，我教你基本拳脚。",
    "hostile": false,
    "combat": null,
    "shop": [
      {
        "item_id": "wooden_stick",
        "price": 80,
        "quantity": 5
      }
    ],
    "services": [
      "teach"
    ],
    "teachable_skills": [
      {
        "skill_id": "basic_fist",
        "cost_gold": 100,
        "cost_potential": 50
      }
    ]
  },
  "thug_a": {
    "id": "thug_a",
    "name": "赵二",
    "title": "街头地痞",
    "location": "taiping_town_center",
    "dialog_default": "小子，看什么呢？想找茬？",
    "hostile": true,
    "combat": {
      "level": 1,
      "hp": 80,
      "mp": 0,
      "strength": 12,
      "agility": 10,
      "intelligence": 5,
      "constitution": 10,
      "attack": 15,
      "defense": 5,
      "speed": 10,
      "skills": [
        "basic_fist"
      ],
      "loot": [
        {
          "item_id": "cloth_shoes",
          "chance": 0.3
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 20
        }
      ]
    },
    "shop": null,
    "services": []
  },
  "thug_b": {
    "id": "thug_b",
    "name": "钱三",
    "title": "东郊恶霸",
    "location": "taiping_east_suburb",
    "dialog_default": "此路是我开，留下买路财！",
    "hostile": true,
    "combat": {
      "level": 2,
      "hp": 100,
      "mp": 0,
      "strength": 14,
      "agility": 8,
      "intelligence": 4,
      "constitution": 12,
      "attack": 18,
      "defense": 6,
      "speed": 9,
      "skills": [
        "basic_fist"
      ],
      "loot": [
        {
          "item_id": "healing_pill",
          "chance": 0.5
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 35
        }
      ]
    },
    "shop": null,
    "services": []
  },
  "bandit": {
    "id": "bandit",
    "name": "李逵",
    "title": "落草强盗",
    "location": "taiping_west_suburb",
    "dialog_default": "嘿嘿，又一个送上门的。",
    "hostile": true,
    "combat": {
      "level": 3,
      "hp": 150,
      "mp": 0,
      "strength": 18,
      "agility": 10,
      "intelligence": 3,
      "constitution": 15,
      "attack": 25,
      "defense": 8,
      "speed": 11,
      "skills": [
        "basic_fist",
        "basic_sword"
      ],
      "loot": [
        {
          "item_id": "walking_stick",
          "chance": 1.0
        },
        {
          "item_id": "iron_sword",
          "chance": 0.3
        },
        {
          "item_id": "copper_coin",
          "chance": 1.0,
          "quantity": 80
        }
      ]
    },
    "shop": null,
    "services": []
  }
};

export const skills = {
  "basic_fist": {
    "id": "basic_fist",
    "name": "基本拳脚",
    "type": "unarmed",
    "description": "最基本的拳脚功夫，是练习高级武功的基础。",
    "max_level": 100,
    "power_per_level": 1.0,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_sword": {
    "id": "basic_sword",
    "name": "基本剑法",
    "type": "sword",
    "description": "剑法入门，招式简单实用。",
    "max_level": 100,
    "power_per_level": 1.2,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_blade": {
    "id": "basic_blade",
    "name": "基本刀法",
    "type": "blade",
    "description": "刀法入门，重在劈砍。",
    "max_level": 100,
    "power_per_level": 1.2,
    "cost_mp": 0,
    "special_effect": null
  },
  "basic_internal": {
    "id": "basic_internal",
    "name": "基本内功",
    "type": "internal",
    "description": "内功基础，能增加内力上限和恢复速度。",
    "max_level": 100,
    "power_per_level": 0.5,
    "cost_mp": 0,
    "special_effect": "increase_mp"
  },
  "basic_dodge": {
    "id": "basic_dodge",
    "name": "基本轻功",
    "type": "dodge",
    "description": "提升闪避能力的轻功基础。",
    "max_level": 100,
    "power_per_level": 0.8,
    "cost_mp": 0,
    "special_effect": "increase_dodge"
  },
  "basic_parry": {
    "id": "basic_parry",
    "name": "基本招架",
    "type": "parry",
    "description": "提升防御能力的招架基础。",
    "max_level": 100,
    "power_per_level": 0.8,
    "cost_mp": 0,
    "special_effect": "increase_defense"
  }
};

export const items = {
  "walking_stick": {
    "id": "walking_stick",
    "name": "拐杖",
    "type": "quest",
    "description": "一根结实的木拐杖，适合老人使用。",
    "effect": null,
    "value": 0,
    "stackable": false
  },
  "gold_coin": {
    "id": "gold_coin",
    "name": "碎银子",
    "type": "material",
    "description": "一小块银子，可以当钱用。",
    "effect": null,
    "value": 100,
    "stackable": true
  },
  "copper_coin": {
    "id": "copper_coin",
    "name": "铜钱",
    "type": "currency",
    "description": "通用的铜钱。",
    "effect": null,
    "value": 1,
    "stackable": true
  },
  "healing_pill": {
    "id": "healing_pill",
    "name": "金创药",
    "type": "consumable",
    "description": "常见的伤药，能恢复一些气血。",
    "effect": {
      "type": "heal_hp",
      "value": 50
    },
    "value": 30,
    "stackable": true
  },
  "steamed_bun": {
    "id": "steamed_bun",
    "name": "肉包子",
    "type": "consumable",
    "description": "热腾腾的肉包子，能恢复少量气血。",
    "effect": {
      "type": "heal_hp",
      "value": 20
    },
    "value": 10,
    "stackable": true
  },
  "wine": {
    "id": "wine",
    "name": "烧刀子",
    "type": "consumable",
    "description": "烈酒，能恢复少量内力。",
    "effect": {
      "type": "heal_mp",
      "value": 20
    },
    "value": 50,
    "stackable": true
  },
  "wooden_stick": {
    "id": "wooden_stick",
    "name": "木棍",
    "type": "weapon",
    "description": "一根结实的木棍。",
    "effect": {
      "attack": 5
    },
    "value": 40,
    "stackable": false
  },
  "iron_sword": {
    "id": "iron_sword",
    "name": "铁剑",
    "type": "weapon",
    "description": "普通的铁剑，比木棍锋利多了。",
    "effect": {
      "attack": 12
    },
    "value": 150,
    "stackable": false
  },
  "cloth_shoes": {
    "id": "cloth_shoes",
    "name": "布鞋",
    "type": "armor",
    "slot": "feet",
    "description": "一双普通的布鞋，穿着轻便。",
    "effect": {
      "speed": 2
    },
    "value": 30,
    "stackable": false
  },
  "cloth_clothes": {
    "id": "cloth_clothes",
    "name": "布衣",
    "type": "armor",
    "slot": "body",
    "description": "一件粗布衣裳，能提供一点防护。",
    "effect": {
      "defense": 3
    },
    "value": 50,
    "stackable": false
  }
};
