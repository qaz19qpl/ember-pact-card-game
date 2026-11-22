// Ember Pact — the rival's mind. Ash reads the table and counters:
// take the kill when it is there, shield up when low, otherwise play the
// biggest damage it can afford, and chase its own resonances.

import { playCard, endPlayerTurn, startTurn } from './state.js';

export function planRivalMove(game) {
  const rival = game.rival;
  const playable = rival.hand
    .map((card, i) => ({ card, i }))
    .filter(({ card }) => card.cost <= rival.mana);
  if (playable.length === 0) return null;

  const lethal = playable.find(({ card }) => {
    if (card.kind === 'ward') return false;
    const bonus = game.playedSuits.includes(card.suit) ? 2 : 0;
    return card.power + bonus >= game.player.life + game.player.shield;
  });
  if (lethal) return lethal.i;

  if (rival.life <= 8) {
    const ward = playable
      .filter(({ card }) => card.kind === 'ward')
      .sort((a, b) => b.card.power - a.card.power)[0];
    if (ward) return ward.i;
  }

  const resonating = playable.filter(({ card }) => game.playedSuits.includes(card.suit));
  const pool = resonating.length > 0 ? resonating : playable;
  const best = pool
    .filter(({ card }) => card.kind !== 'ward')
    .sort((a, b) => (b.card.power / b.card.cost) - (a.card.power / a.card.cost))[0];
  if (best) return best.i;

  const ward = playable.sort((a, b) => b.card.power - a.card.power)[0];
  return ward ? ward.i : null;
}

// Advance the rival turn one step per call (called on a timer from main.js
// so the rival's plays are visible instead of instant).
export function stepRivalTurn(game) {
  if (game.screen !== 'play' || game.turn !== 'rival') return;
  const move = planRivalMove(game);
  if (move === null) {
    game.log.push('Ash ends the turn.');
    startTurn(game, 'player');
    return;
  }
  playCard(game, 'rival', move);
}

export { endPlayerTurn };
