# Memory Game Project

## Table of Contents

- [Game Overview](#overview)
- [State of the game](#state-of-the-game)
- [Dependencies](#dependencies)

## Overview

Implementation of card memory game using HTML, CSS and Javascript based on the starter code of [Udacity's Memory Game project repository](https://github.com/udacity/fend-project-memory-game)

The game board consists of sixteen "cards" arranged in a grid. The deck is made up of eight different pairs of cards, each with different symbols on one side. The cards are arranged randomly on the grid with the symbol face down. The rules are: flip over two hidden cards at a time to locate the ones that match. Once all the cards are matched, you are the winner.

Once the user starts opening a card, a timer will starts and the game will start counting the number of moves (1 move = 2 cards opened). Less number of moves to match all cards, the more the stars.

Three stars are for 8 moves or less to win the game. Subsequently, half a star is deducted every 4 moves.

## State of the game

The game states (cards, number of moves and stars, playing time and number of matched cards) are stored in browser's local storage, until the game is won or the user chooses to restart the game. When the game is opened or browser reload, the game checks for local storage and loads the game state from there if it is available.

## Dependencies

- animate.css from [Daniel Eden](https://daneden.github.io/animate.css/) for CSS animiation
- [Font Awesome](https://fontawesome.com) icons and CSS
- [Google fonts](https://fonts.google.com/)
