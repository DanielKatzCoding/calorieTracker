import { describe, expect, it } from 'vitest';
import { formatQty, servingHint } from './servings';

describe('formatQty', () => {
  it('formats quarters as fractions', () => {
    expect(formatQty(0.5)).toBe('½');
    expect(formatQty(1.5)).toBe('1½');
    expect(formatQty(2)).toBe('2');
    expect(formatQty(0.75)).toBe('¾');
  });
  it('marks approximations', () => {
    expect(formatQty(1.33)).toBe('~1¼');
    expect(formatQty(0.1)).toBe('<¼');
  });
});

describe('servingHint', () => {
  it('scales simple "1 unit" labels and pluralises', () => {
    expect(servingHint({ servingG: 50, servingLabel: '1 egg' }, 100)).toBe('2 eggs');
    expect(servingHint({ servingG: 50, servingLabel: '1 egg' }, 50)).toBe('1 egg');
    expect(servingHint({ servingG: 120, servingLabel: '1 breast' }, 180)).toBe('1½ breasts');
    expect(servingHint({ servingG: 120, servingLabel: '1 tomato' }, 60)).toBe('½ tomato');
    expect(servingHint({ servingG: 120, servingLabel: '1 tomato' }, 240)).toBe('2 tomatoes');
    expect(servingHint({ servingG: 100, servingLabel: '1 patty' }, 200)).toBe('2 patties');
  });
  it('handles fractional and multi-unit labels', () => {
    expect(servingHint({ servingG: 60, servingLabel: '1/4 cup' }, 60)).toBe('¼ cup');
    expect(servingHint({ servingG: 60, servingLabel: '1/4 cup' }, 120)).toBe('½ cup');
    expect(servingHint({ servingG: 80, servingLabel: '2 cups' }, 30)).toBe('¾ cup');
    expect(servingHint({ servingG: 100, servingLabel: '1/2 cucumber' }, 75)).toBe('~½ cucumber');
    expect(servingHint({ servingG: 100, servingLabel: '1/2 cucumber' }, 50)).toBe('¼ cucumber');
    expect(servingHint({ servingG: 90, servingLabel: '3 wings' }, 180)).toBe('6 wings');
    expect(servingHint({ servingG: 3, servingLabel: '5 leaves' }, 6)).toBe('10 leaves');
  });
  it('leaves gram-style and parenthesised labels alone', () => {
    expect(servingHint({ servingG: 28, servingLabel: 'handful (28 g)' }, 28)).toBeNull();
    expect(servingHint({ servingG: 100, servingLabel: '100 g' }, 200)).toBeNull();
  });
  it('returns null without serving data or for tiny amounts', () => {
    expect(servingHint(undefined, 100)).toBeNull();
    expect(servingHint({ servingG: 50, servingLabel: '1 egg' }, 5)).toBeNull();
  });
});
