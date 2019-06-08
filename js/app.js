'use strict';
/*
 * Create a list that holds all of your cards
 */
let new_cards = [];
const default_cards = [
  { card: 'fa-diamond', matched: false },
  { card: 'fa-paper-plane-o', matched: false },
  { card: 'fa-anchor', matched: false },
  { card: 'fa-bolt', matched: false },
  { card: 'fa-cube', matched: false },
  { card: 'fa-anchor', matched: false },
  { card: 'fa-leaf', matched: false },
  { card: 'fa-bicycle', matched: false },
  { card: 'fa-diamond', matched: false },
  { card: 'fa-bomb', matched: false },
  { card: 'fa-leaf', matched: false },
  { card: 'fa-bomb', matched: false },
  { card: 'fa-bolt', matched: false },
  { card: 'fa-bicycle', matched: false },
  { card: 'fa-paper-plane-o', matched: false },
  { card: 'fa-cube', matched: false }
];
const STARS = 3;

const deck = document.getElementsByClassName('deck')[0];
const restart = document.getElementsByClassName('restart')[0];
const moves = document.getElementsByClassName('moves')[0];
const stars = document.getElementById('stars');
const times = document.getElementById('times');
const winning_dialog = document.getElementById('winning-dialog');
const result = document.getElementById('result');

let number_of_moves = 0;
let opened_cards = [];
let play_time = 0;
let matched_pair = 0;
let timer_id = null;
let number_of_stars = STARS;

initGame();
loadEventListener();

// Restart game when user clicks on restart
function restartGame() {
  resetCounters();
  initGame();
}

// Init game with local storage data if available
function initGame() {
  initData();
  //   resetCounters();
  initUI();
}

function initData() {
  let ls_cards,
    ls_matched_pair,
    ls_number_of_moves,
    ls_number_of_stars,
    ls_play_time;
  // Try loading data from local storage first
  if (localStorageAvailable()) {
    console.log('localStorage is available. Trying to load data');
    ls_cards = loadDataFromLocalStorage('cards');
    ls_matched_pair = loadDataFromLocalStorage('matched_pair');
    ls_number_of_moves = loadDataFromLocalStorage('number_of_moves');
    ls_number_of_stars = loadDataFromLocalStorage('number_of_stars');
    ls_play_time = loadDataFromLocalStorage('play_time');

    if (
      ls_cards !== null &&
      ls_number_of_moves !== null &&
      ls_number_of_stars !== null &&
      ls_play_time !== null
    ) {
      if (ls_matched_pair < 8) {
        console.log('Data is available and game is in progress, restoring...');
        new_cards = ls_cards;
        if (ls_matched_pair !== null) matched_pair = ls_matched_pair;
        else matched_pair = 0;
        number_of_moves = ls_number_of_moves;
        play_time = ls_play_time;
        opened_cards = [];
        updateStars(number_of_moves);
        return;
      }
    }
  }
  console.log('localStorage and/or Data is NOT available, resetting...');
  resetCounters();
}

function resetCounters() {
  // clone default cards to new_cards
  new_cards = JSON.parse(JSON.stringify(default_cards));
  new_cards = shuffle(new_cards);

  number_of_moves = 0;
  play_time = 0;
  if (timer_id != null) {
    stopTimer(timer_id);
    timer_id = null;
  }
  opened_cards = [];
  matched_pair = 0;
  number_of_stars = STARS;
  if (localStorageAvailable()) {
    localStorage.removeItem('cards');
    localStorage.removeItem('matched_pair');
    localStorage.removeItem('number_of_stars');
    localStorage.removeItem('number_of_moves');
    localStorage.removeItem('play_time');
  }
}

// Initialize UI based on data
function initUI() {
  moves.innerHTML = number_of_moves;
  times.innerHTML = play_time;
  result.innerHTML = '';
  //   console.log('initUI() >>> new_cards:');
  //   console.log(new_cards);
  storeDataInLocalStorage('cards', new_cards);
  while (deck.firstChild) {
    deck.removeChild(deck.firstChild);
  }

  new_cards.forEach((card, index) => {
    const li = document.createElement('li');
    const icon = document.createElement('i');
    li.className = 'card';
    icon.className = 'fa ' + card.card;
    li.setAttribute('id', 'card-' + index);
    if (card.matched === true) {
      li.classList.add('match');
    }
    li.appendChild(icon);
    deck.appendChild(li);
  });
  if (number_of_stars === 3) {
    [...stars.children].forEach(star_li => {
      if (!star_li.firstElementChild.classList.contains('fa-star')) {
        star_li.firstElementChild.classList.add('fa-star');
      }
      if (star_li.firstElementChild.classList.contains('fa-star-half')) {
        star_li.firstElementChild.classList.remove('fa-star-half');
      }
    });
  }
  winning_dialog.classList.add('closed');
}

// Test local storage functionality
function localStorageAvailable() {
  const test = 'test';
  let value;
  try {
    localStorage.setItem(test, test);
    value = localStorage.getItem(test) == test;
    localStorage.removeItem(test);
    return value && localStorage;
  } catch (exception) {}
}

// Store data in local storage
function storeDataInLocalStorage(key, value) {
  if (localStorageAvailable()) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Load data from local storage
function loadDataFromLocalStorage(key) {
  let value;
  if (localStorageAvailable()) {
    value = localStorage.getItem(key);
    if (value === null) {
      return null;
    } else {
      return JSON.parse(value);
    }
  }
}

// Load event listener
function loadEventListener() {
  deck.addEventListener('click', cardClick);
  restart.addEventListener('click', function() {
    restartGame();
  });
}

// Card Click
function cardClick(e) {
  if (timer_id == null) {
    startTimer();
  }

  if (
    !e.target.classList.contains('open') &&
    !e.target.classList.contains('match') &&
    e.target.classList.contains('card') &&
    opened_cards.length < 2
  ) {
    e.target.classList.add('open');
    e.target.classList.add('show');
    cardOpen(e.target);
  }
}

// Start timer
function startTimer() {
  timer_id = setInterval(() => {
    play_time += 1;
    storeDataInLocalStorage('play_time', play_time);
    times.innerText = play_time;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer_id);
}

// Card Open
function cardOpen(target) {
  opened_cards.push(target);
  if (opened_cards.length == 2) {
    if (checkCard()) {
      // cards match
      cardsMatch();
    } else {
      // cards not match
      setTimeout(cardsNotMatch, 500);
    }
  }
}

// Check Card
function checkCard() {
  let card_match = false;

  increaseMove();
  const first_icon = opened_cards[0].firstElementChild.classList[1];
  const second_icon = opened_cards[1].firstElementChild.classList[1];
  if (first_icon === second_icon) {
    card_match = true;
  }
  return card_match;
}

// Increase moves
function increaseMove() {
  number_of_moves += 1;
  storeDataInLocalStorage('number_of_moves', number_of_moves);
  moves.innerHTML = number_of_moves;
  updateStars(number_of_moves);
}

function updateStars(moves) {
  let n, star_li, star_li_icon;
  //   console.log(`updateStars() >> moves: ${moves}`);

  if (moves % 4 === 1) {
    if (moves >= 17 && moves <= 37) {
      number_of_stars -= 0.5;
      n = 5 - Math.floor(moves / 8);
      //console.log(`updateStars() >> n: ${n}`);
      star_li = document.querySelector('.stars li:nth-child(' + n + ')');
      star_li_icon = star_li.firstElementChild;
      if (moves % 8 === 1) {
        // console.log(`update to half star for ${n}`);
        star_li_icon.classList.remove('fa-star');
        star_li_icon.classList.add('fa-star-half');
      } else if (moves % 8 === 5) {
        // console.log(`remove half start for ${n}`);
        star_li_icon.classList.remove('fa-star-half');
      }
    } else if (moves >= 37) {
      number_of_stars = 0;
    }
    storeDataInLocalStorage('number_of_stars', number_of_stars);
    // console.log(`updateStars() >> number of stars: ${number_of_stars}`);
  }
}

// Cards match
function cardsMatch() {
  matched_pair += 1;

  opened_cards.forEach(opened_card => {
    let card_id;
    card_id = parseInt(opened_card.getAttribute('id').split('-')[1]);
    new_cards[card_id].matched = true;
    opened_card.classList.remove('open', 'show');
    opened_card.classList.add('match');
  });
  storeDataInLocalStorage('cards', new_cards);
  storeDataInLocalStorage('matched_pair', matched_pair);
  opened_cards = [];
  if (matched_pair == 8) {
    stopTimer();
    showWinningModal();
  }
}

function showWinningModal() {
  const msg = `With ${number_of_moves} moves and ${number_of_stars} stars, in ${play_time} seconds`;
  result.innerHTML = msg;
  //  Use setTimeout to give time for matching animation to finish before displaying winning modal
  setTimeout(() => {
    winning_dialog.classList.toggle('closed');
  }, 990);
}

function closeModal() {
  winning_dialog.classList.toggle('closed');
  restartGame();
}

// Cards not match
function cardsNotMatch() {
  const original_icons = [];
  opened_cards.forEach((opened_card, index) => {
    original_icons.push(opened_card.firstElementChild.classList[1]);
    opened_card.classList.remove('open', 'show');
    opened_card.classList.add('unmatch');
    opened_card.firstElementChild.classList.remove(original_icons[index]);
    opened_card.firstElementChild.classList.add('fa-exclamation');
  });

  setTimeout(clearUnmatchCards, 500, original_icons);
}

// Clear Unmatch Cards
function clearUnmatchCards(original_icons) {
  opened_cards.forEach((opened_card, index) => {
    opened_card.firstElementChild.classList.remove('fa-exclamation');
    opened_card.firstElementChild.classList.add(original_icons[index]);
    opened_card.classList.remove('unmatch');
  });
  opened_cards = [];
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
