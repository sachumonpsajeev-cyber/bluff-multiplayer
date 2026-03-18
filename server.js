<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bluff Royale + AI Bot</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #1a2a3a; color: white; text-align: center; }
        .hidden { display: none; }
        .card {
            background: white; color: black; padding: 15px; margin: 5px;
            border-radius: 10px; display: inline-block; cursor: pointer;
            width: 50px; height: 80px; font-weight: bold; border: 3px solid transparent;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: 0.2s;
        }
        .card.selected { border-color: #f1c40f; background: #fffde7; scale: 1.05; }
        #table-area { background: #27ae60; padding: 30px; border-radius: 100px; width: 250px; margin: 20px auto; border: 8px solid #3e2723; }
        button { padding: 10px 20px; font-size: 14px; cursor: pointer; border-radius: 5px; border: none; margin: 5px; font-weight: bold; }
        #play-btn { background: #2ecc71; color: white; }
        #bluff-btn { background: #e74c3c; color: white; }
        #bot-btn { background: #9b59b6; color: white; }
    </style>
</head>
<body>

    <div id="join-screen">
        <h1>🃏 Bluff Multiplayer</h1>
        <input type="text" id="name-input" placeholder="Your Name" style="padding: 10px;">
        <button onclick="join()" style="background: #3498db; color: white;">Join Game</button>
    </div>

    <div id="lobby" class="hidden">
        <h2>Game Lobby</h2>
        <div id="player-list"></div>
        <button id="bot-btn" onclick="addBot()">➕ Add AI Bot</button>
        <button onclick="startGame()" style="background: #f39c12; color: white;">Start Game</button>
    </div>

    <div id="game-board" class="hidden">
        <h2 id="turn-msg">Waiting...</h2>
        <div id="table-area">
            <div style="font-size: 2.5rem;" id="pile-count">0</div>
            <div>Cards in Pile</div>
        </div>
        <p>Current Claim: <strong id="target-rank" style="color: #f1c40f;">None</strong></p>
        
        <h3>Your Hand</h3>
        <div id="my-cards"></div>
        <br>
        <button id="play-btn" onclick="playCards()">Play Cards</button>
        <button id="bluff-btn" onclick="callBluff()">CHALLENGE!</button>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let myHand = [];
        let selectedCards = [];

        function join() {
            const name = document.getElementById('name-input').value;
            if(name) socket.emit('join_game', name);
            document.getElementById('join-screen').classList.add('hidden');
            document.getElementById('lobby').classList.remove('hidden');
        }

        function addBot() { socket.emit('add_bot'); }

        socket.on('player_list_updated', (players) => {
            document.getElementById('player-list').innerHTML = players.map(p => `<div>👤 ${p.name}</div>`).join('');
        });

        function startGame() { socket.emit('start_game'); }

        socket.on('game_started', (data) => {
            document.getElementById('lobby').classList.add('hidden');
            document.getElementById('game-board').classList.remove('hidden');
            renderHand(data.hand);
            updateUI(data);
        });

        function renderHand(hand) {
            myHand = hand;
            selectedCards = [];
            const container = document.getElementById('my-cards');
            container.innerHTML = '';
            hand.forEach((card) => {
                const el = document.createElement('div');
                el.className = 'card';
                el.innerText = card.rank + card.suit;
                el.onclick = () => {
                    el.classList.toggle('selected');
                    const idx = selectedCards.findIndex(c => c.rank === card.rank && c.suit === card.suit);
                    if(idx > -1) selectedCards.splice(idx, 1);
                    else selectedCards.push(card);
                };
                container.appendChild(el);
            });
        }

        function playCards() {
            if(selectedCards.length === 0) return alert("Select cards!");
            
            // DYNAMIC RANK PICKER
            const claim = prompt("What rank are you claiming? (A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K)", "A");
            if(!claim) return;

            socket.emit('play_move', { 
                cards: selectedCards, 
                claimedRank: claim.toUpperCase() 
            });
        }

        function callBluff() { socket.emit('call_bluff'); }

        socket.on('new_hand', (hand) => renderHand(hand));

        socket.on('update_pile', (data) => updateUI(data));

        function updateUI(data) {
            document.getElementById('pile-count').innerText = data.count || 0;
            document.getElementById('turn-msg').innerText = `${data.nextPlayerName}'s Turn`;
            document.getElementById('target-rank').innerText = data.currentRank || "A";
        }

        socket.on('bluff_result', (data) => alert(data.message));

        socket.on('game_over', (data) => {
            alert("🏆 " + data.winner + " won!");
            location.reload();
        });
    </script>
</body>
</html>