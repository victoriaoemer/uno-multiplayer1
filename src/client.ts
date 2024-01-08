import "./styles.css";

/*
TODO:
Anzeigen, wie viele Spieler im Raum sind
Anzeigen, wer wie viele Karten hat
Zug nach einmal Spielen beenden
Anzeigen, wer gerade am Zug ist
Sonderregeln??
Gewinnen, wenn keine Karten mehr gespielt werden können
Deck mischen??
Ablagestapel auf oberste Karte reduzieren
*/

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

let pingInterval: ReturnType<typeof setInterval>;
let isFirstCard = true;

const output = document.getElementById("app") as HTMLDivElement;

const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});


(window as any).login = function () {
  const loginForm = document.getElementById("login-form") as HTMLDivElement;
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const username = usernameInput.value.trim();

  if (username !== "") {
    // Send the username to the server
    conn.send(`login:${username}`);
    // Hide the login form after successful login
    loginForm.style.display = "none";
  } else {
    alert("Please enter a valid username.");
  }
};

(window as any).startGame = function () {
  conn.send('startGame');
};

function addCard(cardText: string, color: string) {
  const card = document.createElement("div");
  card.textContent = cardText.split(" ")[1];
  card.className = `card ${color}`;
  card.onclick = () => {
    conn.send(`moveToDiscardPile:${cardText}`);
  };

  output.appendChild(card);
}

function add(text: string) {
  output.appendChild(document.createTextNode(text));
  output.appendChild(document.createElement("br"));
}

(window as any).drawCard = function () {
  conn.send('drawCard');
};

function movedCardToDiscardPile(cardText: string) {
  const discardPileContainer = document.getElementById("discard-pile") as HTMLDivElement;
  const discardedCard = document.createElement("div");
  discardedCard.textContent = cardText.split(" ")[1];
  const color = cardText.split(" ")[0]; // Extract color from cardText

  discardedCard.className = `card discard-pile-card ${color}`;
  discardPileContainer.appendChild(discardedCard);

  if (!isFirstCard) {

    const handCards = document.getElementsByClassName("card");

    for (let i = 0; i < handCards.length; i++) {
      const handCard = handCards[i] as HTMLElement;
      if (handCard.textContent === discardedCard.textContent && handCard.className.split(" ")[1] === discardedCard.className.split(" ")[2]) {
        handCard.remove();
        break; // Assuming there is only one matching card in the hand
      }
    }
  }
  isFirstCard = false;
}

conn.addEventListener("message", (event) => {
  const message = event.data;

  if (message.startsWith("yourCards:")) {
    const cardsString = message.substring(10);
    const cards = cardsString.split(',');

    cards.forEach((cardText) => {
      const color = cardText.split(" ")[0]; // Extract color from cardText
      addCard(cardText, color);
    });
  } else if (message.startsWith("userJoined:")) {
    const username = message.substring(11);
    add(`${username} joined the party!`);
  } else if (message === "gameStarted") {
    const startGameButton = document.getElementById("start-game") as HTMLButtonElement;
    startGameButton.style.display = "none";
    const drawpile = document.getElementsByClassName("drawpile")[0] as HTMLElement;
    drawpile.style.display = "block";
  } else if (message.startsWith("drawnCard:")) {
    const drawnCard = message.substring(10);
    const color = drawnCard.split(" ")[0];
    addCard(drawnCard, color);
  } else if (message.startsWith("movedToDiscardPile:")) {
    const cardText = message.substring(19);
    movedCardToDiscardPile(cardText);
  } else if (message.startsWith("illegalMove:")) {
    const cardText = message.split(":")[1];
    alert(`Illegal move! You cannot play ${cardText} on the current discard pile.`);
  } else if(message.startsWith("Willkommen")) {
    console.log(message);
    add(`${message}`);
  }
});

