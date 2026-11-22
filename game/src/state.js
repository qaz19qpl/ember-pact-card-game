// Ember Pact — game state: turns, mana, playing cards, resonance, winning.
// Resonance: the second card of a suit played in one turn is stronger and
// triggers that suit's bonus (Flame +2 damage, Tide heal 3, Thorn draw 1,
// Star +1 mana). That is the decision at the heart of every hand.

import { RULES, SUITS, PLAYER_NAME, RIVAL_NAME } from './config.js';
import { buildDeck, drawCards, discardCard } from './deck.js';
import { makeRng } from './rng.js';

export function makeDuelist(name, seed) {
  const rng = makeRng(seed);
  return {
    name,
    rng,
    life: RULES.startLife,
    maxLife: RULES.startLife,
    mana: RULES.startMana,
    maxMana: RULES.startMana,
    shield: 0,
    hand: [],
    deck: buildDeck(rng),
    discard: [],
  };
}

export function newGame(seed) {
  const game = {
    screen: 'title',
    seed,
    round: 1,
    turn: 'player',
    player: makeDuelist(PLAYER_NAME, seed),
    rival: makeDuelist(RIVAL_NAME, seed + 7919),
    log: ['Welcome to Ember Pact. Reduce Ash to 0 Ember to win.'],
    selected: null,
    playedSuits: [],
    resonance: null,
    banner: null,
    bannerUntil: 0,
    winner: null,
    stats: { cardsPlayed: 0, damageDealt: 0, resonances: 0 },
    aiQueue: [],
    aiTimer: 0,
  };
  drawCards(game.player, RULES.startHand, game.log);
  drawCards(game.rival, RULES.startHand, game.log);
  game.player.mana = RULES.startMana;
  game.player.maxMana = RULES.startMana;
  return game;
}

export function startTurn(game, side) {
  const duelist = side === 'player' ? game.player : game.rival;
  game.turn = side;
  game.playedSuits = [];
  game.resonance = null;
  duelist.shield = 0;
  if (side === 'player') {
    game.round += 1;
    duelist.maxMana = Math.min(RULES.maxMana, game.round);
  } else {
    duelist.maxMana = Math.min(RULES.maxMana, duelist.maxMana + 1);
  }
  duelist.mana = duelist.maxMana;
  drawCards(duelist, 1, game.log);
  game.log.push(`${duelist.name}'s turn — ${duelist.mana} mana.`);
  if (side === 'player') game.selected = null;
}

export function dealDamage(game, target, amount, sourceName) {
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked;
    left -= blocked;
    if (blocked > 0) game.log.push(`${target.name}'s shield blocks ${blocked}.`);
  }
  if (left > 0) {
    target.life = Math.max(0, target.life - left);
    game.log.push(`${sourceName} deals ${left} damage to ${target.name}.`);
  }
  return left;
}

export function playCard(game, side, handIndex) {
  const me = side === 'player' ? game.player : game.rival;
  const foe = side === 'player' ? game.rival : game.player;
  const card = me.hand[handIndex];
  if (!card || me.mana < card.cost) return null;
  me.mana -= card.cost;
  me.hand.splice(handIndex, 1);

  const sameSuitBefore = game.playedSuits.filter((s) => s === card.suit).length;
  const resonating = sameSuitBefore >= 1;
  game.playedSuits.push(card.suit);

  let power = card.power + (resonating && (card.kind === 'strike' || card.kind === 'surge' || card.kind === 'tide') ? RULES.resonanceBonus : 0);
  let shieldGain = card.power + (resonating && card.kind === 'ward' ? RULES.resonanceBonus : 0);
  const suit = SUITS[card.suit];

  if (resonating) {
    game.stats.resonances += 1;
    game.resonance = card.suit;
    game.banner = `${suit.name} Resonance!`;
    game.bannerUntil = Date.now() + 1400;
    if (card.suit === 'tide') {
      me.life = Math.min(me.maxLife, me.life + RULES.resonanceHeal);
      game.log.push(`${me.name} resonates ${suit.name} and heals ${RULES.resonanceHeal}.`);
    } else if (card.suit === 'thorn') {
      drawCards(me, 1, game.log);
      game.log.push(`${me.name} resonates ${suit.name} and draws a card.`);
    } else if (card.suit === 'star') {
      me.mana = Math.min(me.maxMana + 1, me.mana + 1);
      game.log.push(`${me.name} resonates ${suit.name} and gains 1 mana.`);
    }
  }

  if (card.kind === 'strike' || card.kind === 'surge') {
    const dealt = dealDamage(game, foe, power, `${me.name}'s ${card.name}`);
    if (side === 'player') game.stats.damageDealt += dealt;
    if (card.kind === 'surge') drawCards(me, 1, game.log);
  } else if (card.kind === 'tide') {
    const dealt = dealDamage(game, foe, power, `${me.name}'s ${card.name}`);
    if (side === 'player') game.stats.damageDealt += dealt;
    me.life = Math.min(me.maxLife, me.life + 2);
    game.log.push(`${me.name} heals 2.`);
  } else if (card.kind === 'ward') {
    me.shield += shieldGain;
    game.log.push(`${me.name} gains ${shieldGain} shield.`);
  }

  game.stats.cardsPlayed += 1;
  discardCard(me, card);
  checkEnd(game);
  return card;
}

export function checkEnd(game) {
  if (game.screen !== 'play') return;
  if (game.rival.life <= 0) {
    game.screen = 'win';
    game.winner = 'player';
    game.log.push('Ash is out of Ember — you win the pact!');
  } else if (game.player.life <= 0) {
    game.screen = 'loss';
    game.winner = 'rival';
    game.log.push('Your Ember is spent — Ash wins the pact.');
  }
}

export function endPlayerTurn(game) {
  if (game.screen !== 'play' || game.turn !== 'player') return;
  game.selected = null;
  game.log.push('You end your turn.');
  startTurn(game, 'rival');
}

export function beginPlay(game) {
  game.screen = 'play';
  game.round = 1;
  game.player.maxMana = RULES.startMana;
  game.player.mana = RULES.startMana;
  game.log.push('Round 1 — your turn. Play a card, then end your turn.');
}

export function restart(game) {
  const fresh = newGame(game.seed + 1);
  Object.keys(fresh).forEach((k) => { game[k] = fresh[k]; });
  game.screen = 'play';
}
