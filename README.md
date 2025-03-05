# Tiles

[try it out!](https://redslug.github.io/tiles/)

![game.png](game.png)

## Setup

Install and run game

```
nvm install 22
cd tiles
npm install
npm run dev
```

## Deploy

```
npm run deploy
```

## Enhancement ideas

- make code more readable by having separate Peer / page for host vs friend
- make it a multi 2-4 player game
- calculate end of round scores using contiguous multipliers
- do end of round cleanup (remove tile from rows and move to final rows)
- create a bot to play against
- add a timer and have timeout (30 seconds)
- remove `setTimeout`
- add celebration upon winning game
- randomly generate initial turn number to have start player be random
- bring back `<StrictMode>`
- make overflow row clickable
- add a browser icon
- move it to iOS
- simplify `clickDestination` by maybe using hash maps
