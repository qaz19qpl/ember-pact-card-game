// Ember Pact — screenshot staging. ?shot=title|table|win|loss puts the
// game into a fixed, seeded state so a screenshot replays exactly.
// This only stages states the game itself can reach by playing.

import { newGame, beginPlay, playCard, startTurn } from './state.js';
import { drawCards } from './deck.js';
import { RULES } from './config.js';

function stageTable(game) {
  beginPlay(game);
  // A mid-duel table: both sides have spent some Ember and mana, hands full.
  game.player.life = 14;
  game.rival.life = 11;
  game.player.shield = 3;
  game.player.mana = 5;
  game.player.maxMana = 5;
  game.rival.mana = 4;
  game.rival.maxMana = 4;
  game.round = 4;
  game.log.push('You play Cinder Fang — 4 damage to Ash.');
  game.log.push('Ash plays Tide Ward and gains 4 shield.');
  game.log.push('Flame Resonance! Your next Flame card hits harder.');
  game.selected = 2;
  // Make sure the staged hand shows a spread of suits and costs.
  while (game.player.hand.length < 6) drawCards(game.player, 1, game.log);
  game.player.hand = game.player.hand.slice(0, 6);
  game.resonance = 'flame';
}

function stageWin(game) {
  stageTable(game);
  game.rival.life = 0;
  game.screen = 'win';
  game.winner = 'player';
  game.stats = { cardsPlayed: 17, damageDealt: 24, resonances: 5 };
  game.round = 6;
}

function stageLoss(game) {
  stageTable(game);
  game.player.life = 0;
  game.screen = 'loss';
  game.winner = 'rival';
  game.stats = { cardsPlayed: 13, damageDealt: 15, resonances: 3 };
  game.round = 6;
}

export function applyShotParam(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  if (shot === 'title') {
    game.screen = 'title';
  } else if (shot === 'table') {
    stageTable(game);
  } else if (shot === 'win') {
    stageWin(game);
  } else if (shot === 'loss') {
    stageLoss(game);
  } else {
    return false;
  }
  return true;
}

export { newGame, playCard, startTurn, RULES };
