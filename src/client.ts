import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

let pingInterval: ReturnType<typeof setInterval>;
let isFirstCard = true;

const output = document.getElementById("app") as HTMLDivElement;
const loginForm = document.getElementById("login-form") as HTMLDivElement;

const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});


(window as any).drawCard = function () {
  conn.send('drawCard');
};

// Machen Sie die Login-Funktion global verfügbar
(window as any).login = function () {
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

function add(text: string) {
  output.appendChild(document.createTextNode(text));
  output.appendChild(document.createElement("br"));
}


function addCard(cardText: string, color: string) {
  const card = document.createElement("div");
  card.textContent = cardText.split(" ")[1];
  card.className = `card ${color}`;
  card.onclick = () => {
    // Handle card click event
    console.log(cardText)
    conn.send(`moveToDiscardPile:${cardText}`);
  };

  output.appendChild(card);
}


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
        console.log(handCard.className.split(" ")[1]);
        console.log(discardedCard.className.split(" ")[2]);
        handCard.remove();
        break; // Assuming there is only one matching card in the hand
      }
    }
  }
  isFirstCard = false;

}

function displayCardValue(cardText: string) {
  const cardValue = cardText // Extract the numeric value from cardText
  console.log(`Clicked card value: ${cardValue}`);
}


// Neues Event für das Empfangen von Benutzernamen
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
  } else {
    add(`${message}`);
  }
});

(window as any).login = function () {
  const usernameForm = document.getElementById("login-form") as HTMLDivElement;
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

// You can even start sending messages before the connection is open!


// Let's listen for when the connection opens
// And send a ping every 2 seconds right after
conn.addEventListener("open", () => {
  add("Connected!");

});
