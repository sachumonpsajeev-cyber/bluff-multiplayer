# 🃏 Bluff Multiplayer Royale
A real-time, web-based version of the classic card game "Bluff" (also known as Cheat or I Doubt It).

## 🎮 How to Play
1. **Join the Lobby:** Enter your name and wait for other players.
2. **The Goal:** Be the first player to get rid of all your cards.
3. **The Play:** On your turn, you must play one or more cards face-down and claim they are the "Target Rank" (e.g., "Two Aces").
4. **The Bluff:** You can lie! You don't actually have to play the target rank.
5. **The Challenge:** If another player thinks you are lying, they click **BLUFF!**.
   - If you were **lying**, you must take the entire center pile.
   - If you were **telling the truth**, the person who challenged you takes the entire pile.

## 🛠️ Tech Stack
- **Backend:** Node.js & Express
- **Real-Time Engine:** Socket.io (WebSockets)
- **Frontend:** HTML5 & CSS3 (Vanilla JS)

## 🚀 Installation
1. Clone the repo: `git clone [YOUR_REPO_LINK]`
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
