# 🃏 Bluff Multiplayer Royale 
### *A High-Stakes Game of Deception & Strategy*

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://bluff-multiplayer-t0rl.onrender.com)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-blue.svg)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Real--time-Socket.io-orange.svg)](https://socket.io/)

---

## 👨‍💻 Developed By
**Sachu Mon Puthenpuraickkal Sajeev** *MSc - Data Analytics and AI* **TSI University (Transport and Telecommunication Institute)** ---

## 🎮 About the Game
**Bluff Multiplayer Royale** is a real-time, web-based adaptation of the classic card game "Cheat." Built for the modern web, it brings the tension of face-to-face psychological warfare to the browser. 

Whether you're playing against friends across the world or testing your luck against our **integrated AI Bot**, the goal remains the same: **Don't get caught lying.**

### 🌟 Key Features
* **Real-Time Sync:** Powered by WebSockets for zero-lag gameplay.
* **Dynamic AI Bot:** No friends online? Challenge the AI that knows how to bluff (and how to catch you).
* **Custom Claims:** Unlike basic versions, players can choose which rank they are claiming to play.
* **Mobile-Responsive:** Play on your phone, tablet, or desktop.
* **Auto-Reset:** Seamlessly transition from one round to the next.

---

## 🕹️ How to Play
1.  **Enter the Arena:** Join the lobby and wait for players or add an **AI Bot**.
2.  **The Objective:** Empty your hand before anyone else.
3.  **The Move:** Select cards from your hand and "Claim" they are a specific rank (e.g., "3 Kings").
4.  **The Deception:** You can play *any* cards. You don't have to tell the truth.
5.  **The Challenge:** If a player clicks **CHALLENGE!**:
    * If the player was **Lying**: They take the entire center pile.
    * If the player was **Truthful**: The Challenger takes the entire pile.

---

## 🛠️ Technical Architecture
* **Frontend:** HTML5, CSS3 (Modern UI), and Vanilla JavaScript.
* **Server:** Node.js with the Express framework.
* **Networking:** Socket.io for bi-directional, event-based communication.
* **Deployment:** Cloud-hosted on Render.

---

## 🚀 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v14 or higher)
* [npm](https://www.npmjs.com/)

### Installation
1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/sachumonpsajeev-cyber/bluff-multiplayer.git](https://github.com/sachumonpsajeev-cyber/bluff-multiplayer.git)
    cd bluff-multiplayer
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Launch the Server**
    ```bash
    node server.js
    ```
4.  **Play!**
    Open `http://localhost:3000` in your browser.

---

## 🗺️ Roadmap (Future Enhancements)
- [ ] **Global Chat:** Real-time trash talk during games.
- [ ] **Leaderboards:** Track wins/losses via MongoDB integration.
- [ ] **Advanced AI:** Neural network-based bots that learn player bluffing patterns.
- [ ] **Card Animations:** Smooth CSS transitions for dealing and playing cards.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Created as a project demonstrating real-time data synchronization and AI integration.*
