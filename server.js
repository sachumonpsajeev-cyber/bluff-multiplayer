const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// --- GLOBAL GAME STATE ---
let gameState = {
    players: {},      
    pile: [],         
    currentRank: 'A', 
    turnIndex: 0,
    lastPlayerId: null,
    lastPlayedCards: []
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- HELPER: DECK CREATOR ---
function createAndShuffleDeck() {
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
    for (let s of suits) {
        for (let v of values) {
            deck.push({ suit: s, rank: v });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// --- GAME LOGIC ---
io.on('connection', (socket) => {
    
    // 1. Join Game
    socket.on('join_game', (userName) => {
        gameState.players[socket.id] = {
            id: socket.id,
            name: userName || "Player",
            hand: [],
            isBot: false
        };
        io.emit('player_list_updated', Object.values(gameState.players));
    });

    // 2. Add AI Bot
    socket.on('add_bot', () => {
        const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
        gameState.players[botId] = {
            id: botId,
            name: "🤖 AI Bot",
            hand: [],
            isBot: true
        };
        io.emit('player_list_updated', Object.values(gameState.players));
    });

    // 3. Start Game
    socket.on('start_game', () => {
        const deck = createAndShuffleDeck();
        const ids = Object.keys(gameState.players);
        if (ids.length < 2) return;

        ids.forEach(id => gameState.players[id].hand = []);
        let i = 0;
        while (deck.length > 0) {
            gameState.players[ids[i % ids.length]].hand.push(deck.pop());
            i++;
        }

        gameState.pile = [];
        gameState.turnIndex = 0;
        gameState.currentRank = 'A';

        ids.forEach(id => {
            io.to(id).emit('game_started', {
                hand: gameState.players[id].hand,
                turnIndex: gameState.turnIndex,
                nextPlayerName: gameState.players[ids[0]].name,
                currentRank: gameState.currentRank
            });
        });
        checkBotTurn();
    });

    // 4. Play Move
    socket.on('play_move', (data) => {
        const player = gameState.players[socket.id];
        if(!player) return;

        gameState.lastPlayedCards = data.cards;
        gameState.lastPlayerId = socket.id;
        gameState.currentRank = data.claimedRank; 
        gameState.pile.push(...data.cards);

        player.hand = player.hand.filter(card => 
            !data.cards.some(c => c.rank === card.rank && c.suit === card.suit)
        );

        if (player.hand.length === 0) {
            io.emit('game_over', { winner: player.name });
            return;
        }

        const ids = Object.keys(gameState.players);
        gameState.turnIndex = (gameState.turnIndex + 1) % ids.length;
        broadcastUpdate();
    });

    // 5. Call Bluff
    socket.on('call_bluff', () => {
        if (!gameState.lastPlayerId || gameState.pile.length === 0) return;

        const isLying = gameState.lastPlayedCards.some(c => c.rank !== gameState.currentRank);
        const loserId = isLying ? gameState.lastPlayerId : socket.id;

        const message = isLying ? 
            `${gameState.players[gameState.lastPlayerId].name} caught lying!` : 
            `${gameState.players[gameState.lastPlayerId].name} was honest!`;

        gameState.players[loserId].hand.push(...gameState.pile);
        gameState.pile = [];
        
        io.emit('bluff_result', { message: message + " Loser takes the pile." });
        io.to(loserId).emit('new_hand', gameState.players[loserId].hand);
        
        const ids = Object.keys(gameState.players);
        gameState.turnIndex = ids.indexOf(loserId);
        broadcastUpdate();
    });

    function broadcastUpdate() {
        const ids = Object.keys(gameState.players);
        const nextPlayer = gameState.players[ids[gameState.turnIndex]];
        io.emit('update_pile', {
            count: gameState.pile.length,
            nextPlayerName: nextPlayer.name,
            currentRank: gameState.currentRank
        });
        checkBotTurn();
    }

    function checkBotTurn() {
        const ids = Object.keys(gameState.players);
        const currentPlayer = gameState.players[ids[gameState.turnIndex]];
        if (currentPlayer && currentPlayer.isBot) {
            setTimeout(() => {
                const cardsToPlay = [currentPlayer.hand[0]]; // Simple bot logic
                gameState.lastPlayedCards = cardsToPlay;
                gameState.lastPlayerId = currentPlayer.id;
                gameState.pile.push(...cardsToPlay);
                currentPlayer.hand.splice(0, 1);
                
                gameState.turnIndex = (gameState.turnIndex + 1) % ids.length;
                broadcastUpdate();
            }, 2000);
        }
    }

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        io.emit('player_list_updated', Object.values(gameState.players));
    });
});

// --- RENDER-READY PORT CONFIG ---
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});