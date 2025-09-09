import json
import pprint

with open("static/allcards.json") as f:
    allcards = json.load(f)

    mydict = {}

    for card in allcards["items"]:

        mydict[card["name"]] = {
            "name": card["name"],
            "icon": card["iconUrls"]["medium"],
            "rarity": card["rarity"],
            "isChampion": card["rarity"].lower() == "champion",
            "isEvolution": False
        }

        try:
            cyclecount = 0
            if card["elixirCost"] <= 4 and card["name"] != "Goblin Cage (Evolution)" and card["name"] != "Baby Dragon (Evolution)":
                cyclecount = 2
            else:
                cyclecount = 1

            mydict[f"{card["name"]} (Evolution)"] = {
                "name": f"{card["name"]} (Evolution)",
                "icon": card["iconUrls"]["evolutionMedium"],
                "rarity": card["rarity"],
                "isChampion": card["rarity"] == "champion",
                "isEvolution": True,
                "currentcycle": 0,
                "maxcycle": cyclecount
            }
        except KeyError:
            pass
    

with open("static/cards.json", "w") as f:
    json.dump(mydict, f, indent=4)
