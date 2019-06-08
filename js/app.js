'use strict';
const STARS = 3;
const card_icons = [
  'diamond',
  'paper-plane-o',
  'anchor',
  'bolt',
  'cube',
  'leaf',
  'bicycle',
  'bomb'
];

const deck = document.getElementsByClassName('deck')[0];
const restart = document.getElementsByClassName('restart')[0];
const moves = document.getElementsByClassName('moves')[0];
const stars = document.getElementById('stars');
const times = document.getElementById('times');
const winning_dialog = document.getElementById('winning-dialog');
const result = document.getElementById('result');

let new_cards = [];
let number_of_moves = 0;
let opened_cards = [];
let play_time = 0;
let matched_pair = 0;
let timer_id = null;
let number_of_stars = STARS;

initGame();
loadEventListener();

function buildNewCards() {
  let cards = [];
  let icon_index = -1;
  let card_tracking = Array(8).fill(0);
  for (var i = 0; i <= 15; i++) {
    let card_filled = false;
    while (!card_filled) {
      icon_index = Math.floor(Math.random() * 8);
      if (card_tracking[icon_index] < 2) {
        cards[i] = { card: 'fa-' + card_icons[icon_index], matched: false };
        card_tracking[icon_index] += 1;
        card_filled = true;
      }
    }
  }
  return cards;
}

// Restart game when user clicks on restart
function restartGame() {
  resetCounters();
  initUI();
}

// Init game with local storage data if available
function initGame() {
  initData();
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
        number_of_stars = ls_number_of_stars;
        play_time = ls_play_time;
        opened_cards = [];
        // updateStars(number_of_moves);
      } else {
        console.log('Game has been won, resetting...');
        resetCounters();
      }
    } else {
      console.log('localStorage and/or Data is NOT available, resetting...');
      resetCounters();
    }
  }
}

function resetCounters() {
  new_cards = buildNewCards();
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
  updateStarsUI();
  winning_dialog.classList.add('closed');
}

function updateStarsUI() {
  [...stars.children].forEach((star_li, index) => {
    let star_li_icon;
    star_li_icon = star_li.firstElementChild;
    if (number_of_stars > index) {
      if (number_of_stars < index + 1) {
        star_li_icon.classList.add('fa-star-half');
        star_li_icon.classList.remove('fa-star');
      } else {
        star_li_icon.classList.add('fa-star');
        star_li_icon.classList.remove('fa-star-half');
      }
    } else {
      star_li_icon.classList.remove('fa-star-half');
      star_li_icon.classList.remove('fa-star');
    }
  });
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
  if (moves % 4 === 1) {
    if (moves >= 9 && moves <= 24) {
      number_of_stars -= 0.5;
    } else if (moves >= 24) {
      number_of_stars = 0;
    }
    storeDataInLocalStorage('number_of_stars', number_of_stars);
  }
  updateStarsUI();
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
