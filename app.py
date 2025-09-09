from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import re
import pprint

app = Flask(__name__)

with open("static/cards.json", "r", encoding="utf-8") as f:
    cards_data = json.load(f)


def increaseEvoInDeck(_deck, _card):
    for i in range(len(_deck)):
        if _deck[i] is not None and _deck[i]["name"] == _card["name"]:
            if _deck[i]["isEvolution"]:
                _deck[i]["currentcycle"] += 1
                _deck[i]["currentcycle"] = _deck[i]["currentcycle"] % (_deck[i]["maxcycle"] + 1)
            return

@app.route("/")
def home():
    return render_template("admin.html")

@app.route("/display")
def display():
    return render_template("display.html")

@app.route("/reset", methods=["GET", "POST"])
def reset():
    with open("static/cycle.json", "w") as f:
        json.dump({
            "drawpile": [None, None, None, None],
            "activehand": [None, None, None, None],
            "deck": [None, None, None, None, None, None, None, None],
            "limbo": None,
            "championInDeck": None,
            "cardsPlayed": 0,
            "actions": [
                [[None, None, None, None], [None, None, None, None], [None, None, None, None, None, None, None, None], None, None, 0]
            ]
        }, f, indent=4)
    return redirect(url_for("home"))


@app.route("/search")
def search():
    query = request.args.get("q", "").lower().strip()
    results = []

    if query:
        for name, data in cards_data.items():
            # normalize name by removing punctuation and lowering
            normalized_name = re.sub(r'[^a-z0-9]', '', name.lower())
            normalized_query = re.sub(r'[^a-z0-9]', '', query)

            if normalized_query in normalized_name:
                results.append(data)

    return jsonify(results)

@app.route("/use-card", methods=["POST"])
def use_card():
    data = request.get_json()
    card = data.get("card")

    if card is None:
        return {"status": "card DNE"}
    
    with open("static/cycle.json") as f:
        cycle = json.load(f)

        if card not in cycle["activehand"]:
            return {"status": "card not in hand"}

        # behaviour for champions
        if card["isChampion"] and card == cycle["championInDeck"]:
            cycle["limbo"] = card
            cycle["championInDeck"] = card
            index = cycle["activehand"].index(card)
            cycle["activehand"][index] = cycle["drawpile"].pop(0)

        # behaviour for non-champions
        else:
            index = cycle["activehand"].index(card)
            cycle["activehand"][index] = cycle["drawpile"].pop(0)

            # increase cycle if card is evolution
            if card["isEvolution"]:
                increaseEvoInDeck(cycle["deck"], card)
                card["currentcycle"] += 1
                card["currentcycle"] = card["currentcycle"] % (card["maxcycle"] + 1)
            
            cycle["drawpile"].append(card)

        cycle["cardsPlayed"] += 1

        with open("static/cycle.json", "w") as f:
            json.dump(cycle, f, indent=4)

        return {"status": "success"}
    
@app.route("/undo",)
def undo():
    with open("static/cycle.json") as f:
        cycle = json.load(f)

        if len(cycle["actions"]) == 0:
            return {"status": "no actions to undo"}

        cycle["actions"].pop()
        last_action = cycle["actions"][-1]

        cycle["drawpile"] = last_action[0]
        cycle["activehand"] = last_action[1]
        cycle["deck"] = last_action[2]
        cycle["limbo"] = last_action[3]
        cycle["championInDeck"] = last_action[4]
        cycle["cardsPlayed"] = last_action[5]

        with open("static/cycle.json", "w") as f:
            json.dump(cycle, f, indent=4)

        return {"status": "success"}

@app.route("/add-card", methods=["POST"])
def add_card():
    data = request.get_json()
    card = data.get("card")

    if card is None:
        return {"status": "card DNE"}
    
    

    with open("static/cycle.json") as f:
        cycle = json.load(f)

        if card in cycle["activehand"] or card in cycle["drawpile"]:
            return {"status": "card already in deck"}
        
        if cycle["deck"].count(None) == 0:
            return {"status": "deck full"}
    
        # behaviour for champions only
        if card["isChampion"] and cycle["championInDeck"] is None:
            cycle["championInDeck"] = card
        # behaviour for all cards including champions
        cycle["activehand"][cycle["activehand"].index(None)] = card
        cycle["deck"][cycle["deck"].index(None)] = card

    with open("static/cycle.json", "w") as f:
        json.dump(cycle, f, indent=4)

    return {"status": "success"}

@app.route("/save-state", methods=["POST"])
def save_state():
    with open("static/cycle.json") as f:
        cycle = json.load(f)

        cycle["actions"].append(
            [
                cycle["drawpile"],
                cycle["activehand"],
                cycle["deck"],
                cycle["limbo"],
                cycle["championInDeck"],
                cycle["cardsPlayed"]
            ]
        )

    with open("static/cycle.json", "w") as f:
        json.dump(cycle, f, indent=4)

    return {"status": "success"}

@app.route("/get-cards")
def get_cards():
    with open("static/cycle.json") as f:
        cycle = json.load(f)
    return jsonify({
        "status": "success",
        "drawpile": cycle["drawpile"],
        "activehand": cycle["activehand"],
        "deck": cycle["deck"],
        "limbo": cycle["limbo"],
        "cardsplayed": cycle["cardsPlayed"],
    })

@app.route("/kill-champion")
def kill_champion():
    with open("static/cycle.json") as f:
        cycle = json.load(f)

        if cycle["championInDeck"]:
            if cycle["limbo"] is not None:
                cycle["drawpile"].insert(2, cycle["limbo"])
                cycle["limbo"] = None
            else:
                return {"status": "no champion to kill"}
        else:
            return {"status": "no champion to kill"}

    with open("static/cycle.json", "w") as f:
        json.dump(cycle, f, indent=4)

    return {"status": "success"}

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")