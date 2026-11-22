// Ember Pact — boot and game loop. One frame at a time: advance the
// rival's turn on a timer, then draw the table.

import { TABLE } from './config.js';
import { newGame } from './state.js';
import { stepRivalTurn } from './ai.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { applyShotParam } from './shots.js';
import { pickSeed } from './rng.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = TABLE.width;
canvas.height = TABLE.height;

const game = newGame(pickSeed());
const staged = applyShotParam(game);
attachInput(canvas, game);

let lastAiStep = 0;
let frames = 0;

function loop(now) {
  if (game.screen === 'play' && game.turn === 'rival' && !staged) {
    if (now - lastAiStep > 750) {
      lastAiStep = now;
      stepRivalTurn(game);
    }
  } else {
    lastAiStep = now;
  }
  render(ctx, game);
  frames += 1;
  if (frames === 3) window.__shotReady = true;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
