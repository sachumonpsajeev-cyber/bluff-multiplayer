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

// --- NETWORK LOGIC ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_game', (userName) => {
        gameState.players[socket.id] = {
            id: socket.id,
            name: userName || "Player",
            hand: []
        };
        io.emit('player_list_updated', Object.values(gameState.players));
    });

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

        ids.forEach(id => {
            io.to(id).emit('game_started', {
                hand: gameState.players[id].hand,
                turnIndex: gameState.turnIndex,
                nextPlayerName: gameState.players[ids[0]].name
            });
        });
    });

    socket.on('play_move', (data) => {
        const player = gameState.players[socket.id];
        gameState.lastPlayedCards = data.cards;
        gameState.lastPlayerId = socket.id;
        gameState.pile.push(...data.cards);

        player.hand = player.hand.filter(card => 
            !data.cards.some(c => c.rank === card.rank && c.suit === card.suit)
        );

        const ids = Object.keys(gameState.players);
        gameState.turnIndex = (gameState.turnIndex + 1) % ids.length;
        const nextPlayer = gameState.players[ids[gameState.turnIndex]];

        io.emit('update_pile', {
            count: gameState.pile.length,
            nextPlayerName: nextPlayer.name,
            lastClaim: `${data.cards.length} ${gameState.currentRank}'s`
        });

        socket.emit('new_hand', player.hand);
    });

    socket.on('call_bluff', () => {
        if (!gameState.lastPlayerId || gameState.pile.length === 0) return;

        const isLying = gameState.lastPlayedCards.some(c => c.rank !== gameState.currentRank);
        const liarId = gameState.lastPlayerId;
        const challengerId = socket.id;
        const loserId = isLying ? liarId : challengerId;

        const message = isLying ? 
            `${gameState.players[liarId].name} was LYING!` : 
            `${gameState.players[liarId].name} told the truth!`;

        gameState.players[loserId].hand.push(...gameState.pile);
        gameState.pile = [];
        
        io.emit('bluff_result', { message: message + " Loser takes the pile." });
        io.to(loserId).emit('new_hand', gameState.players[loserId].hand);
        io.emit('update_pile', { count: 0, nextPlayerName: gameState.players[loserId].name });
    });

    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
        io.emit('player_list_updated', Object.values(gameState.players));
    });
});

http.listen(3000, () => console.log('Server running at http://localhost:3000'));