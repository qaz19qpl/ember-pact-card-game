// Ember Pact — configuration: suits, cards, table constants.
// Every number the game balances on lives here and nowhere else.

export const TABLE = { width: 1280, height: 800 };

export const SUITS = {
  flame: { name: 'Flame', color: '#ff6a3d', dark: '#a83214', glyph: '▲', bonus: '+2 damage on resonance' },
  tide: { name: 'Tide', color: '#3da9ff', dark: '#145a9e', glyph: '≈', bonus: 'heal 3 on resonance' },
  thorn: { name: 'Thorn', color: '#58c96b', dark: '#1f7a33', glyph: '✦', bonus: 'draw 1 on resonance' },
  star: { name: 'Star', color: '#ffc93d', dark: '#9e7414', glyph: '★', bonus: '+1 mana on resonance' },
};

export const SUIT_ORDER = ['flame', 'tide', 'thorn', 'star'];

// kind: strike = damage; ward = shield; surge = damage + draw 1; tide = damage + heal 2.
export const CARD_DEFS = [
  { id: 'ember-slash', name: 'Ember Slash', suit: 'flame', cost: 1, power: 2, kind: 'strike' },
  { id: 'cinder-fang', name: 'Cinder Fang', suit: 'flame', cost: 2, power: 4, kind: 'strike' },
  { id: 'blaze-rush', name: 'Blaze Rush', suit: 'flame', cost: 3, power: 5, kind: 'strike' },
  { id: 'inferno-pact', name: 'Inferno Pact', suit: 'flame', cost: 4, power: 7, kind: 'strike' },
  { id: 'flame-ward', name: 'Flame Ward', suit: 'flame', cost: 2, power: 3, kind: 'ward' },
  { id: 'spark-trick', name: 'Spark Trick', suit: 'flame', cost: 1, power: 1, kind: 'surge' },
  { id: 'ripple-cut', name: 'Ripple Cut', suit: 'tide', cost: 1, power: 2, kind: 'tide' },
  { id: 'deep-current', name: 'Deep Current', suit: 'tide', cost: 2, power: 3, kind: 'tide' },
  { id: 'moonwell', name: 'Moonwell', suit: 'tide', cost: 3, power: 4, kind: 'tide' },
  { id: 'tide-ward', name: 'Tide Ward', suit: 'tide', cost: 2, power: 4, kind: 'ward' },
  { id: 'undertow', name: 'Undertow', suit: 'tide', cost: 2, power: 3, kind: 'surge' },
  { id: 'still-water', name: 'Still Water', suit: 'tide', cost: 1, power: 2, kind: 'ward' },
  { id: 'bramble-jab', name: 'Bramble Jab', suit: 'thorn', cost: 1, power: 2, kind: 'strike' },
  { id: 'vine-snare', name: 'Vine Snare', suit: 'thorn', cost: 2, power: 3, kind: 'strike' },
  { id: 'thornwall', name: 'Thornwall', suit: 'thorn', cost: 2, power: 4, kind: 'ward' },
  { id: 'root-grasp', name: 'Root Grasp', suit: 'thorn', cost: 3, power: 4, kind: 'surge' },
  { id: 'seedling', name: 'Seedling', suit: 'thorn', cost: 1, power: 1, kind: 'surge' },
  { id: 'briar-storm', name: 'Briar Storm', suit: 'thorn', cost: 4, power: 6, kind: 'strike' },
  { id: 'starfall', name: 'Starfall', suit: 'star', cost: 2, power: 4, kind: 'strike' },
  { id: 'comet-shard', name: 'Comet Shard', suit: 'star', cost: 3, power: 5, kind: 'strike' },
  { id: 'nova-ward', name: 'Nova Ward', suit: 'star', cost: 3, power: 5, kind: 'ward' },
  { id: 'lucky-star', name: 'Lucky Star', suit: 'star', cost: 1, power: 1, kind: 'surge' },
  { id: 'astral-pact', name: 'Astral Pact', suit: 'star', cost: 4, power: 6, kind: 'surge' },
  { id: 'starlight', name: 'Starlight', suit: 'star', cost: 1, power: 2, kind: 'tide' },
];

export const RULES = {
  startLife: 20,
  startHand: 3,
  startMana: 1,
  maxMana: 8,
  maxHand: 7,
  resonanceBonus: 2,
  resonanceHeal: 3,
  fatigueDamage: 1,
  deckSize: CARD_DEFS.length,
};

export const KIND_TEXT = {
  strike: (p) => `Deal ${p} damage.`,
  ward: (p) => `Gain ${p} shield.`,
  surge: (p) => `Deal ${p} damage. Draw a card.`,
  tide: (p) => `Deal ${p} damage. Heal 2.`,
};

export const RIVAL_NAME = 'Ash, the Cinder Rival';
export const PLAYER_NAME = 'You';
