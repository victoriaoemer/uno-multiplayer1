// server.ts
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  drawPile: string[] = [];
  discardPile: string[] = [];


  constructor(readonly room: Party.Room) {
  }

  initializeDrawPile() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Create Uno deck with cards of different colors and numbers for the draw pile
    for (const color of colors) {
      for (const number of numbers) {
        this.drawPile.push(`${color} ${number}`);
      }
    }

    // Shuffle the draw pile
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }

    const initialCard = this.drawPile.pop();
    this.discardPile.push(initialCard);
    this.room.broadcast(`movedToDiscardPile:${initialCard}`);
  }

  drawCard(player: Party.Connection) {
    if (this.drawPile.length === 0) {
      this.drawPile = this.shufflePlayedCards();
    }

    const drawnCard = this.drawPile.pop();
    player.send(`drawnCard:${drawnCard}`);
  }

  moveCardToDiscardPile(player: Party.Connection, cardText: string) {
    const lastCardOnDiscardPile = this.discardPile[this.discardPile.length - 1];

    // Check if the move is legal according to Uno rules
    if (!lastCardOnDiscardPile || this.isMoveLegal(cardText, lastCardOnDiscardPile)) {
      this.discardPile.push(cardText);
      this.room.broadcast(`movedToDiscardPile:${cardText}`);
    } else {
      player.send(`illegalMove:${cardText}`);
    }
  }

  isMoveLegal(card1: string, card2: string): boolean {
    const [color1, number1] = card1.split(" ");
    const [color2, number2] = card2.split(" ");

    // Check if the colors match or the numbers match
    return color1 === color2 || number1 === number2;
  }

  shufflePlayedCards() {
    const shuffledCards = this.drawPile.slice(); // Copy draw pile
    this.drawPile = []; // Clear draw pile
    this.initializeDrawPile(); // Initialize draw pile again

    return shuffledCards;
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );
  }

  dealCards() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const deck = [];


    // Create Uno deck with cards of different colors and numbers
    for (const color of colors) {
      for (const number of numbers) {
        deck.push(`${color} ${number}`);
      }
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal 7 cards to each player
    this.room.connections.forEach((player) => {
      const playerCards = deck.slice(0, 7);
      player.send(`yourCards:${playerCards.join(',')}`);
      deck.splice(0, 7); // Remove dealt cards from the deck
    });
  }


  onMessage(message: string, sender: Party.Connection) {
    if (message.startsWith("login:")) {
      const username = message.substring(6);
      sender.send(`Willkommen ${username}!`);
      this.room.broadcast(`userJoined:${username}`, [sender.id]);
    } else if (message === 'startGame') {
      this.initializeDrawPile();
      this.dealCards();
      this.room.broadcast('gameStarted');
    } else if (message === 'drawCard') {
      this.drawCard(sender);
    } if (message.startsWith("moveToDiscardPile:")) {
      const cardText = message.split(":")[1];
      this.moveCardToDiscardPile(sender, cardText);
    } else {
      this.room.broadcast(
        `${sender.id}: ${message}`,
        [sender.id]
      );
    }
  }
}

Server satisfies Party.Worker;
