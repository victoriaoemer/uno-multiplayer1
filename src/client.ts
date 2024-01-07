import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

let pingInterval: ReturnType<typeof setInterval>;

const output = document.getElementById("app") as HTMLDivElement;
const loginForm = document.getElementById("login-form") as HTMLDivElement;

const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});


(window as any).drawCard = function() {
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
  card.textContent = cardText;
  card.className = `card ${color}`;
  card.onclick = () => {
    // Handle card click event
    moveCardToDiscardPile(cardText);
  };

  output.appendChild(card);
}

function moveCardToDiscardPile(cardText: string) {
  const discardPileContainer = document.getElementById("discard-pile") as HTMLDivElement;
  const discardedCard = document.createElement("div");
  discardedCard.textContent = cardText;
  const color = cardText.slice(0, -1);
  discardedCard.className = `card discard-pile-card ${color.toLowerCase()}`;
  discardPileContainer.appendChild(discardedCard);

}

function displayCardValue(cardText: string) {
  const cardValue = cardText // Extract the numeric value from cardText
  alert(`Clicked card value: ${cardValue}`);
}


// Neues Event für das Empfangen von Benutzernamen
conn.addEventListener("message", (event) => {
  const message = event.data;

  if (message.startsWith("yourCards:")) {
    const cardsString = message.substring(10);
    const cards = cardsString.split(',');
    
    cards.forEach((cardText) => {
      const color = cardText.slice(0, -1); // Extract color from cardText
      addCard(cardText, color);
    });
  } else if (message.startsWith("userJoined:")) {
    const username = message.substring(11);
    add(`${username} joined the party!`);
  } else if (message.startsWith("drawnCard:")) {
    const drawnCard = message.substring(10);
    const color = drawnCard.slice(0, -1);
    addCard(drawnCard, color);
  } else {
    add(`${message}`);
  }
});

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

(window as any).startGame = function() {
  conn.send('startGame');
};

// You can even start sending messages before the connection is open!


// Let's listen for when the connection opens
// And send a ping every 2 seconds right after
conn.addEventListener("open", () => {
  add("Connected!");

});
