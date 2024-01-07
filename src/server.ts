// server.ts
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  drawPile: string[] = [];
  discardPile: string[] = [];


  constructor(readonly room: Party.Room) {
    this.initializeDrawPile();
  }

  initializeDrawPile() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Create Uno deck with cards of different colors and numbers for the draw pile
    for (const color of colors) {
      for (const number of numbers) {
        this.drawPile.push(`${color}${number}`);
      }
    }

    // Shuffle the draw pile
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  drawCard(player: Party.Connection) {
    if (this.drawPile.length === 0) {
      this.drawPile = this.shufflePlayedCards();
    }

    const drawnCard = this.drawPile.pop();
    player.send(`drawnCard:${drawnCard}`);
  }

  moveCardToDiscardPile(player: Party.Connection, cardText: string) {
    // Validate if the move is legal according to your Uno game rules
    // For simplicity, let's assume any card can be moved to the discard pile for now
    this.discardPile.push(cardText);
    this.room.broadcast(`movedToDiscardPile:${cardText}`);
  }

  shufflePlayedCards() {
    // Implement logic to shuffle cards from played pile back to draw pile
    // if draw pile is empty.
    // You may need to keep track of the played cards in another array.
    // For simplicity, you can implement a basic reshuffling logic here.
    // Make sure to adapt it to your specific game rules.
    // ...

    // Placeholder for reshuffling logic
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
        deck.push(`${color}${number}`);
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
  
      // Send the username to the current connection
      sender.send(`Welcome, ${username}!`);
  
      // Broadcast the new user to all connections except the sender
      this.room.broadcast(`userJoined:${username}`, [sender.id]);
    } else   if (message === 'startGame') {
      this.dealCards();
    } else if (message === 'drawCard') {
      this.drawCard(sender);
    } if (message.startsWith("moveToDiscardPile:")) {
      const cardText = message.substring(19);
      this.moveCardToDiscardPile(sender, cardText);
    } else {
      console.log(`connection ${sender.id} sent message: ${message}`);
      this.room.broadcast(
        `${sender.id}: ${message}`,
        [sender.id]
      );
    }
  }
}

Server satisfies Party.Worker;
