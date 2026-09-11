import type { FoodItem } from '@/domain/types';

const IRREGULAR_PLURAL: Record<string, string> = { leaf: 'leaves', half: 'halves', tomato: 'tomatoes', potato: 'potatoes', mango: 'mangoes' };
const NO_PLURAL = /\(|\bg\b|\bml\b|\bcup\b$/; // "handful (28 g)", "100 g" style labels: leave alone

function singularize(word: string): string {
  for (const [s, p] of Object.entries(IRREGULAR_PLURAL)) if (word === p) return s;
  if (/ies$/.test(word)) return word.slice(0, -3) + 'y';
  if (/(ches|shes|sses|xes|oes)$/.test(word)) return word.slice(0, -2);
  if (/s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
  return word;
}

function pluralize(word: string): string {
  if (IRREGULAR_PLURAL[word]) return IRREGULAR_PLURAL[word]!;
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
  if (/(ch|sh|s|x|z)$/.test(word)) return word + 'es';
  return word + 's';
}

/** Parses "1", "1/2", "1 1/2", "2.5" → number; null when the token is not numeric. */
function parseLead(token: string): number | null {
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(token);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = /^(\d+)\/(\d+)$/.exec(token);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(token);
  return Number.isFinite(n) ? n : null;
}

const QUARTERS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** 0.5 → "½", 1.5 → "1½", 2 → "2", 0.33 → "~⅓"-ish approximated to quarters with a tilde. */
export function formatQty(q: number): string {
  const rounded = Math.round(q * 4) / 4;
  const approx = Math.abs(rounded - q) > 0.06 ? '~' : '';
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 100) / 100;
  if (rounded === 0) return `${approx}¼`.replace('~¼', '<¼');
  const fracStr = QUARTERS[frac] ?? '';
  return `${approx}${whole > 0 ? whole : ''}${fracStr}`;
}

/**
 * Human hint for a gram amount based on the food's serving definition,
 * e.g. egg 100 g → "2 eggs", tomato 60 g → "½ tomato", hummus 60 g with "1/4 cup" → "¼ cup".
 */
export function servingHint(food: Pick<FoodItem, 'servingG' | 'servingLabel'> | undefined, grams: number): string | null {
  if (!food?.servingG || !food.servingLabel || grams <= 0) return null;
  const label = food.servingLabel.trim();
  if (NO_PLURAL.test(label) && !/^\d/.test(label)) return null;
  const m = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.+)$/.exec(label);
  if (!m) return null;
  const lead = parseLead(m[1]!);
  if (lead === null || lead <= 0) return null;
  const unitRaw = m[2]!.trim();
  if (/^(g|ml|grams?)$/i.test(unitRaw)) return null; // "100 g" adds nothing over the gram figure
  const total = (grams / food.servingG) * lead;
  if (total < 0.2) return null;
  if (NO_PLURAL.test(unitRaw)) return `${formatQty(total)} ${unitRaw}`;
  const singular = lead > 1 ? singularize(unitRaw) : unitRaw;
  const unit = Math.round(total * 4) / 4 > 1 ? pluralize(singular) : singular;
  return `${formatQty(total)} ${unit}`;
}
