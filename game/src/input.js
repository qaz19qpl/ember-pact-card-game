// Ember Pact — mouse and keyboard input: select and play cards,
// end the turn, start from the title, restart after the duel.

import { CARD_W, CARD_H, handLayout } from './render.js';
import { playCard, endPlayerTurn, beginPlay, restart } from './state.js';
import { playSound, toggleMute, unlockAudio } from './audio.js';

const END_TURN = { x: 1075, y: 465, w: 150, h: 52 };

function canvasPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1280,
    y: ((event.clientY - rect.top) / rect.height) * 800,
  };
}

function hitCard(game, x, y) {
  const layout = handLayout(game.player.hand);
  for (let i = layout.length - 1; i >= 0; i -= 1) {
    const slot = layout[i];
    const raised = game.selected === i ? 26 : 0;
    if (x >= slot.x && x <= slot.x + CARD_W && y >= slot.y - raised && y <= slot.y + CARD_H) return i;
  }
  return -1;
}

function tryPlay(game, index) {
  if (game.turn !== 'player') return;
  const card = game.player.hand[index];
  if (!card) return;
  if (card.cost > game.player.mana) {
    game.log.push(`Not enough mana for ${card.name}.`);
    playSound('damage');
    return;
  }
  const played = playCard(game, 'player', index);
  if (played) {
    game.selected = null;
    playSound(played.kind === 'ward' ? 'heal' : 'card');
    if (game.screen === 'win') playSound('win');
    if (game.screen === 'loss') playSound('loss');
  }
}

export function attachInput(canvas, game) {
  canvas.addEventListener('click', (event) => {
    unlockAudio();
    const { x, y } = canvasPos(canvas, event);
    if (game.screen === 'title') {
      beginPlay(game);
      playSound('click');
      return;
    }
    if (game.screen === 'win' || game.screen === 'loss') return;
    if (x >= END_TURN.x && x <= END_TURN.x + END_TURN.w && y >= END_TURN.y && y <= END_TURN.y + END_TURN.h) {
      endPlayerTurn(game);
      playSound('click');
      return;
    }
    const index = hitCard(game, x, y);
    if (index >= 0) {
      if (game.selected === index) {
        tryPlay(game, index);
      } else {
        game.selected = index;
        playSound('click');
      }
    } else {
      game.selected = null;
    }
  });

  window.addEventListener('keydown', (event) => {
    unlockAudio();
    const key = event.key.toLowerCase();
    if (key === 'm') {
      const muted = toggleMute();
      game.log.push(muted ? 'Sound off.' : 'Sound on.');
      return;
    }
    if (game.screen === 'title' && (key === 'enter' || key === ' ')) {
      beginPlay(game);
      playSound('click');
      return;
    }
    if ((game.screen === 'win' || game.screen === 'loss') && key === 'r') {
      restart(game);
      playSound('click');
      return;
    }
    if (game.screen !== 'play') return;
    if (key === 'e') {
      endPlayerTurn(game);
      playSound('click');
      return;
    }
    if (key >= '1' && key <= '7') {
      const index = Number(key) - 1;
      if (game.player.hand[index]) {
        game.selected = game.selected === index ? null : index;
        playSound('click');
      }
      return;
    }
    if (key === 'enter' && game.selected !== null) tryPlay(game, game.selected);
  });
}
