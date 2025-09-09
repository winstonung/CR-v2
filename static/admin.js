document.getElementById("cardSearch").addEventListener("input", async function () {
    const query = this.value;
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    if (query.length < 1) return;

    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();

    results.forEach(card => {
        const div = document.createElement("div");
        div.classList.add("search-result");

        const img = document.createElement("img");
        img.src = card.icon;
        img.alt = card.name;
        img.width = 50;

        const name = document.createElement("span");
        name.textContent = card.name;

        div.appendChild(img);
        div.appendChild(name);

        // 👇 what happens when you click
        div.addEventListener("click", async () => {
            console.log("You clicked:", card.name);
            if (await addCard(card) === "success") {
                await saveState();
                // 👇 Clear search bar and results
                document.getElementById("cardSearch").value = "";
                resultsDiv.innerHTML = "";
            }
        });

        

        resultsDiv.appendChild(div);
    });
});

async function useCard(card) {
    const response = await fetch("/use-card", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ card })
    });

    const result = await response.json();
    console.log("Use card result:", result);

    return result.status;
}

async function addCard(card) {
    const response = await fetch("/add-card", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ card })
    });

    const result = await response.json();
    console.log("Add card result:", result);
    if (result.status === "success") {
        return await useCard(card);
    }
    return result.status;
}

async function saveState() {
    const response = await fetch("/save-state", {
        method: "POST"
    });
    const result = await response.json();
    console.log("Save state result:", result);
    return result.status === "success";
}

async function getCards() {
    const response = await fetch("/get-cards");
    const result = await response.json();
    console.log("Get cards result:", result.status);
    console.log(result);
    return result;
}

async function clickedCard(cardNumber) {
    const response = await fetch("/get-cards");
    const cards = await response.json();
    const card = cards.deck[cardNumber - 1];
    console.log(cards.deck);
    console.log(card);

    if (card !== null) {
        console.log("You clicked:", card.name);
        if (await useCard(card) === "success") {
            await saveState();
        }
    }
}

async function undo() {
    const response = await fetch("/undo", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Undo result:", data.status);
        return data.status;
    })
    .catch(error => console.error("Error undoing action:", error));
}

async function killChampion() {
    const response = await fetch("/kill-champion");
    const result = await response.json();
    console.log("Kill champion result:", result.status);
    console.log(result);
    return result;
}

document.getElementById("card1").addEventListener("click", async () => {
    await clickedCard(1);
});
document.getElementById("card2").addEventListener("click", async () => {
   await clickedCard(2);
});
document.getElementById("card3").addEventListener("click", async () => {
   await clickedCard(3);
});
document.getElementById("card4").addEventListener("click", async () => {
   await clickedCard(4);
});
document.getElementById("card5").addEventListener("click", async () => {
   await clickedCard(5);
});
document.getElementById("card6").addEventListener("click", async () => {
   await clickedCard(6);
});
document.getElementById("card7").addEventListener("click", async () => {
   await clickedCard(7);
});
document.getElementById("card8").addEventListener("click", async () => {
   await clickedCard(8);
});

document.getElementById("limbo").addEventListener("click", async () => {
   await killChampion();
});

document.getElementById("undo").addEventListener("click", async () => {
   await undo();
});

getCards();