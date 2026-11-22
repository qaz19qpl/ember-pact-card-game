// Ember Pact — decks: build, draw, discard, reshuffle, fatigue.
// Both duelists play the same 24-card list, shuffled with their own seed.

import { CARD_DEFS, RULES } from './config.js';
import { shuffle } from './rng.js';

let uidCounter = 1;

export function buildDeck(rng) {
  const deck = CARD_DEFS.map((def) => ({ ...def, uid: uidCounter++ }));
  return shuffle(deck, rng);
}

export function drawCards(duelist, count, log) {
  for (let i = 0; i < count; i += 1) {
    if (duelist.deck.length === 0) {
      if (duelist.discard.length === 0) {
        duelist.life -= RULES.fatigueDamage;
        log.push(`${duelist.name} has no cards left and takes ${RULES.fatigueDamage} fatigue.`);
        continue;
      }
      reshuffleDiscard(duelist);
      log.push(`${duelist.name} reshuffles the discard pile.`);
    }
    const card = duelist.deck.pop();
    if (duelist.hand.length >= RULES.maxHand) {
      duelist.discard.push(card);
      log.push(`${duelist.name}'s hand is full — a drawn card is lost.`);
      continue;
    }
    duelist.hand.push(card);
  }
}

export function reshuffleDiscard(duelist) {
  const rng = duelist.rng;
  duelist.deck = shuffle(duelist.discard.splice(0), rng);
}

export function discardCard(duelist, card) {
  duelist.discard.push(card);
}
