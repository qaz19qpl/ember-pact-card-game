// Ember Pact — all canvas drawing: the table, the hands, the cards,
// the life and mana, the title screen and the win / loss screens.

import { TABLE, SUITS, KIND_TEXT, RIVAL_NAME } from './config.js';

const CARD_W = 150;
const CARD_H = 210;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  let size = 16;
  ctx.font = `bold ${size}px Georgia, serif`;
  while (ctx.measureText(text).width > maxWidth && size > 9) {
    size -= 1;
    ctx.font = `bold ${size}px Georgia, serif`;
  }
  return size;
}

export function drawCard(ctx, card, x, y, opts = {}) {
  const { selected = false, dimmed = false, small = false } = opts;
  const w = small ? CARD_W * 0.62 : CARD_W;
  const h = small ? CARD_H * 0.62 : CARD_H;
  const suit = SUITS[card.suit];
  const yOff = selected ? -26 : 0;

  ctx.save();
  ctx.translate(x, y + yOff);
  if (dimmed) ctx.globalAlpha = 0.45;
  ctx.shadowColor = selected ? suit.color : 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = selected ? 22 : 10;
  ctx.shadowOffsetY = 6;
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = '#f7efe0';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Suit band.
  rr(ctx, 0, 0, w, h * 0.26, 12);
  ctx.fillStyle = suit.color;
  ctx.fill();
  ctx.fillRect(0, h * 0.2, w, h * 0.06);

  // Cost gem.
  ctx.beginPath();
  ctx.arc(24, 24, 17, 0, Math.PI * 2);
  ctx.fillStyle = '#2b1d5e';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd76a';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), 24, 25);

  // Suit name + glyph.
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(suit.name.toUpperCase(), 48, 20);
  ctx.textAlign = 'right';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(suit.glyph, w - 12, 24);

  // Card name.
  ctx.fillStyle = '#241a12';
  ctx.textAlign = 'center';
  fitText(ctx, card.name, w - 16);
  ctx.fillText(card.name, w / 2, h * 0.26 + 30);

  // Power.
  ctx.fillStyle = suit.dark;
  ctx.font = `bold ${small ? 44 : 58}px Georgia, serif`;
  ctx.fillText(String(card.power), w / 2, h * 0.58);
  ctx.fillStyle = '#6b5a44';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(card.kind === 'ward' ? 'SHIELD' : 'POWER', w / 2, h * 0.58 + 26);

  // Kind text.
  ctx.fillStyle = '#3a2f24';
  ctx.font = '13px Georgia, serif';
  const words = KIND_TEXT[card.kind](card.power).split(' ');
  let line = '';
  let ly = h - 44;
  const lines = [];
  for (const word of words) {
    if (ctx.measureText(`${line} ${word}`.trim()).width > w - 20) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  lines.push(line.trim());
  for (const l of lines.slice(0, 2)) {
    ctx.fillText(l, w / 2, ly);
    ly += 16;
  }

  if (selected) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd76a';
    rr(ctx, -3, -3, w + 6, h + 6, 14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFaceDown(ctx, x, y, w, h) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#3a2a6e';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd76a';
  ctx.stroke();
  rr(ctx, x + 8, y + 8, w - 16, h - 16, 7);
  ctx.strokeStyle = 'rgba(255,215,106,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', x + w / 2, y + h / 2);
}

function drawLifeOrb(ctx, x, y, label, life, maxLife, shield, accent) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(x - 14, y - 16, 6, x, y, 46);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(0.45, accent);
  g.addColorStop(1, '#5e1a08');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(life), x, y - 2);
  ctx.font = '11px Georgia, serif';
  ctx.fillText('EMBER', x, y + 20);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f3e9d2';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText(label, x + 58, y - 12);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#cbb98f';
  const sub = shield > 0 ? `Shield ${shield}  ·  ${life}/${maxLife}` : `${life}/${maxLife} Ember`;
  ctx.fillText(sub, x + 58, y + 12);
  ctx.restore();
}

function drawMana(ctx, x, y, mana, maxMana) {
  ctx.save();
  ctx.fillStyle = '#f3e9d2';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('MANA', x, y);
  for (let i = 0; i < maxMana; i += 1) {
    const cx = x + 58 + i * 24;
    ctx.beginPath();
    ctx.arc(cx, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < mana ? '#4fc3ff' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = i < mana ? '#bfe9ff' : 'rgba(255,255,255,0.3)';
    ctx.stroke();
  }
  ctx.restore();
}

function drawLog(ctx, game) {
  const x = 1004;
  const y = 120;
  ctx.save();
  rr(ctx, x, y, 252, 330, 12);
  ctx.fillStyle = 'rgba(10,8,28,0.55)';
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('THE PACT LOG', x + 14, y + 26);
  ctx.font = '12px Georgia, serif';
  ctx.fillStyle = '#d8cdb4';
  const lines = game.log.slice(-13);
  lines.forEach((entry, i) => {
    const text = entry.length > 44 ? `${entry.slice(0, 43)}…` : entry;
    ctx.fillText(text, x + 14, y + 50 + i * 22);
  });
  ctx.restore();
}

function drawTable(ctx) {
  const g = ctx.createRadialGradient(640, 380, 60, 640, 400, 720);
  g.addColorStop(0, '#2c2350');
  g.addColorStop(0.6, '#1a1433');
  g.addColorStop(1, '#0d0a1e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TABLE.width, TABLE.height);
  // Felt ring.
  ctx.beginPath();
  ctx.ellipse(640, 400, 560, 300, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,180,90,0.16)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(640, 400, 470, 240, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,180,90,0.08)';
  ctx.stroke();
}

function drawTitle(ctx, game) {
  drawTable(ctx);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 92px Georgia, serif';
  ctx.shadowColor = '#ff6a3d';
  ctx.shadowBlur = 34;
  ctx.fillText('EMBER PACT', 640, 220);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f3e9d2';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of cards, suits and resonance', 640, 268);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#cbb98f';
  ctx.fillText('Outplay Ash. Spend mana, chain suits, and burn their Ember to zero.', 640, 306);
  ctx.fillText('Resonance: play two cards of one suit in a turn — the second strikes harder.', 640, 332);

  // Decorative fanned cards.
  const demo = [
    { name: 'Inferno Pact', suit: 'flame', cost: 4, power: 7, kind: 'strike' },
    { name: 'Moonwell', suit: 'tide', cost: 3, power: 4, kind: 'tide' },
    { name: 'Briar Storm', suit: 'thorn', cost: 4, power: 6, kind: 'strike' },
  ];
  demo.forEach((card, i) => {
    ctx.save();
    ctx.translate(490 + i * 130, 470);
    ctx.rotate((i - 1) * 0.12);
    drawCard(ctx, card, -75, -105);
    ctx.restore();
  });

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('Click or press Enter to begin', 640, 690);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#9d8f6d';
  ctx.fillText('Mouse + keyboard  ·  1–7 select a card  ·  Enter plays it  ·  E ends your turn', 640, 724);
  ctx.restore();
}

function drawEnd(ctx, game) {
  const win = game.screen === 'win';
  ctx.save();
  ctx.fillStyle = win ? 'rgba(20,16,4,0.82)' : 'rgba(8,4,16,0.85)';
  ctx.fillRect(0, 0, TABLE.width, TABLE.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = win ? '#ffd76a' : '#8fa3c8';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.shadowColor = win ? '#ff6a3d' : '#3da9ff';
  ctx.shadowBlur = 30;
  ctx.fillText(win ? 'THE PACT IS YOURS' : 'THE EMBERS FADE', 640, 300);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f3e9d2';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(
    win ? 'Ash is out of Ember. The table is yours.' : 'Ash takes the pact this time. Shuffle up and go again.',
    640, 352,
  );
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#cbb98f';
  ctx.fillText(`Rounds played: ${game.round}   ·   Cards played: ${game.stats.cardsPlayed}   ·   Damage dealt: ${game.stats.damageDealt}   ·   Resonances: ${game.stats.resonances}`, 640, 420);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('Press R to play again', 640, 500);
  ctx.restore();
}

export function handLayout(hand) {
  const n = hand.length;
  const total = n * (CARD_W + 10) - 10;
  const startX = 640 - total / 2;
  return hand.map((card, i) => ({ card, x: startX + i * (CARD_W + 10), y: 560 }));
}

export function render(ctx, game) {
  ctx.clearRect(0, 0, TABLE.width, TABLE.height);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  drawTable(ctx);

  // Rival hand, face down.
  game.rival.hand.forEach((_, i) => {
    drawFaceDown(ctx, 470 + i * 62, 26, 52, 74);
  });
  ctx.fillStyle = '#cbb98f';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.rival.hand.length} cards in hand`, 470, 122);

  drawLifeOrb(ctx, 120, 90, RIVAL_NAME, game.rival.life, game.rival.maxLife, game.rival.shield, '#ff6a3d');
  drawLifeOrb(ctx, 120, 690, 'You', game.player.life, game.player.maxLife, game.player.shield, '#3da9ff');
  drawMana(ctx, 190, 530, game.player.mana, game.player.maxMana);
  drawMana(ctx, 190, 150, game.rival.mana, game.rival.maxMana);

  // Deck piles.
  ctx.fillStyle = '#cbb98f';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Ash's deck: ${game.rival.deck.length}`, 1180, 60);
  ctx.fillText(`Your deck: ${game.player.deck.length}`, 1180, 760);

  // Turn banner.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = game.turn === 'player' ? '#ffd76a' : '#8fa3c8';
  ctx.fillText(game.turn === 'player' ? `ROUND ${game.round} — YOUR TURN` : `ROUND ${game.round} — ASH IS THINKING…`, 640, 210);
  if (game.resonance) {
    const suit = SUITS[game.resonance];
    ctx.fillStyle = suit.color;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText(`${suit.glyph} ${suit.name.toUpperCase()} RESONANCE ${suit.glyph}`, 640, 248);
    ctx.fillStyle = '#f3e9d2';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(suit.bonus, 640, 272);
  }
  if (game.banner && Date.now() < game.bannerUntil) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText(game.banner, 640, 320);
  }
  ctx.restore();

  drawLog(ctx, game);

  // End Turn button.
  const btn = { x: 1075, y: 465, w: 150, h: 52 };
  ctx.save();
  rr(ctx, btn.x, btn.y, btn.w, btn.h, 12);
  ctx.fillStyle = game.turn === 'player' ? '#ff6a3d' : '#4a4360';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd76a';
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('End Turn  [E]', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  ctx.restore();

  // Player hand.
  const layout = handLayout(game.player.hand);
  layout.forEach(({ card, x, y }, i) => {
    const affordable = card.cost <= game.player.mana && game.turn === 'player';
    drawCard(ctx, card, x, y, { selected: game.selected === i, dimmed: !affordable });
  });

  // Hint line.
  ctx.save();
  ctx.fillStyle = '#9d8f6d';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click a card to select it, click again to play it. Chain one suit twice in a turn for Resonance.', 640, 792);
  ctx.restore();

  if (game.screen === 'win' || game.screen === 'loss') drawEnd(ctx, game);
}

export { CARD_W, CARD_H };
