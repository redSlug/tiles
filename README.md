# Tiles

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

- make it multi a 2-4 player game
- make negative tiles count in score
- calculate end of round scores using contiguous multipliers
- do end of round cleanup (remove tile from rows and move to final rows)
- create a bot to play against
- maybe add a timer and have timeout (30 seconds)
- visual updates for different browser types
- remove `setTimeout`
- add celebration upon winning game
- make it mobile friendly
- deploy to github pages
- randomly generate initial turn number to have start player be random
- bring back `<StrictMode>`
- make overflow row clickable
- add a browser icon
- move it to iOS
- simplify `clickDestination` by maybe using hash maps
