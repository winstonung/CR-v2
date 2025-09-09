let cardsjson;


function cardInDeck(deck, card) {
    for (let i = 0; i < deck.length; i++) {
        if (deck[i] !== null) {
            if (deck[i].name === card.name) {
                return true;
            }
        }
    }
    return false;
}

fetch("/static/cycle.json")  // Your JSON file with just names and IDs
    .then(res => res.json())
    .then(data => {
        cardsjson = data;
    })
    .catch(err => console.error("Failed to load cycle.json:", err));

function getCards() {
    fetch("/get-cards")
    .then(response => response.json())
    .then(data_ => {
        if (data_.status === "success") {
            updateStyles(data_);
        } else {
            console.error("Failed to get cards");
        }
    })
    .catch(error => console.error("Error fetching cards:", error));

}

function updateStyles(data) {
    const activeHand = data.activehand;
    const drawPile = data.drawpile;
    const cardsplayed = data.cardsplayed;
    const deck = data.deck;

    for (let i = 0; i < activeHand.length; i++) {
        let stringify = i + 1 + "";
        let current = document.getElementById("activehand" + stringify);
        if (current != null) {
            if (activeHand[i] !== null) {
                current.src = activeHand[i].icon;
            } else {
                current.src = "/static/images/MysteryCard.png";
            }
        }
        let cycle = document.getElementById("cycle-activehand" + stringify);
        if (cycle != null) {
            if (activeHand[i] !== null) {
                if (activeHand[i].isEvolution) {
                    cycle.innerText = activeHand[i].currentcycle + "/" + activeHand[i].maxcycle;
                    cycle.style.visibility = "visible";
                } else {
                    cycle.style.visibility = "hidden";
                }
            } else {
                cycle.style.visibility = "hidden";
            }
        }
    }
    
    let drawpile4 = document.getElementById("drawpile4");
    let cycledrawpile4 = document.getElementById("cycle-drawpile4");
    if (drawpile4 !== null) {
        if (drawPile.length === 3) {
            drawpile4.style.visibility = "hidden";
            cycledrawpile4.style.visibility = "hidden";
        } else {
            drawpile4.style.visibility = "visible";
            cycledrawpile4.style.visibility = "visible";
        }
    }

    for (let i = 0; i < drawPile.length; i++) {
        let stringify = i + 1 + "";
        let next = document.getElementById("drawpile" + stringify);
        
        if (next != null) {
            if (drawPile[i] !== null) {
                next.src = drawPile[i].icon;
            } else {
                next.src = "/static/images/MysteryCard.png";
            }
        }
        let cycle = document.getElementById("cycle-drawpile" + stringify);
        if (cycle != null) {
            if (drawPile[i] !== null) {
                if (drawPile[i].isEvolution) {
                    cycle.innerText = drawPile[i].currentcycle + "/" + drawPile[i].maxcycle;
                    cycle.style.visibility = "visible";
                } else {
                    cycle.style.visibility = "hidden";
                }
            } else {
                cycle.style.visibility = "hidden";
            }
        }
    }
    
    let cardsplayedDOM = document.getElementById("cardsplayed");
    if (cardsplayedDOM!= null ) { 
        cardsplayedDOM.innerText = cardsplayed;
    }

    for (let i = 0; i < 8; i++) {
        let stringify = i + 1 + "";
        let deckCard = document.getElementById("card" + stringify);
        if (deckCard != null) {
            if (deck[i] !== null) {
                deckCard.src = deck[i].icon;
                if (cardInDeck(activeHand, deck[i])) {
                    deckCard.style.visibility = "visible";
                } else {
                    deckCard.style.visibility = "hidden";
                }
            } else {
                deckCard.src = "/static/images/MysteryCard.png";
                deckCard.style.visibility = "visible";
            }
        }
    }


    cardSearchBar = document.getElementById("cardSearch");
    cardSearchResults = document.getElementById("searchResults");
    if (deck.includes(null) && cardSearchBar != null) {
        cardSearchBar.style.visibility = "visible";
        cardSearchResults.style.visibility = "visible";
    } else {
        if (cardSearchBar != null) {
            cardSearchBar.style.visibility = "hidden";
            cardSearchResults.style.visibility = "hidden";
        }
    }

    let limbo = document.getElementById("limbo");
    if (limbo != null) {
        if (data.limbo !== null) {
            limbo.src = data.limbo.icon;
            limbo.style.visibility = "visible";
        } else {
            limbo.src = "/static/images/MysteryCard.png";
            limbo.style.visibility = "hidden";
        }
    }

}
getCards();
setInterval(getCards, 200);