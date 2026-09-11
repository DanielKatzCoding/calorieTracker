import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { DateKey, DiarySource, FoodItem, MealSlot, ResolvedRecipe } from '@/domain/types';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { RESOLVED_RECIPES, RESOLVED_RECIPES_BY_ID, searchFoods, useFoods } from '@/hooks/useFoods';
import { useToast } from '@/hooks/useToast';
import { Sheet } from '@/components/Sheet';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { foodAllowed, matchesConstraints } from '@/domain/menu/filter';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { menuRepo } from '@/storage/repos/menuRepo';
import { fmt } from '@/lib/labels';
import { PortionEditor, type Addable } from './PortionEditor';
import { CustomFoodForm } from './CustomFoodForm';

type Tab = 'search' | 'recent' | 'menu';

export function FoodSearchSheet({ open, slot: initialSlot, dateKey, onClose }: { open: boolean; slot: MealSlot; dateKey: DateKey; onClose: () => void }) {
  const { profile } = useReadyProfile();
  const { foods, foodsById } = useFoods();
  const toast = useToast();
  const [slot, setSlot] = useState<MealSlot>(initialSlot);
  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Addable | null>(null);
  const [creating, setCreating] = useState(false);
  const [lastSlot, setLastSlot] = useState(initialSlot);
  if (initialSlot !== lastSlot) {
    setLastSlot(initialSlot);
    setSlot(initialSlot);
  }

  const recent = useLiveQuery(() => diaryRepo().recentSources(15), []);
  const menu = useLiveQuery(() => menuRepo().get(dateKey), [dateKey]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { foods: [] as FoodItem[], recipes: [] as ResolvedRecipe[] };
    return {
      foods: searchFoods(foods, query, 25),
      recipes: RESOLVED_RECIPES.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 6),
    };
  }, [query, foods]);

  const close = () => {
    setPicked(null);
    setCreating(false);
    setQuery('');
    onClose();
  };

  const resolveSource = (s: DiarySource): Addable | null => {
    if (s.kind === 'food') {
      const f = foodsById.get(s.foodId);
      return f ? { kind: 'food', food: f } : null;
    }
    if (s.kind === 'recipe') {
      const r = RESOLVED_RECIPES_BY_ID.get(s.recipeId);
      return r ? { kind: 'recipe', recipe: r, scale: s.scale } : null;
    }
    return null;
  };

  const fits = (item: Addable) => (item.kind === 'food' ? foodAllowed(item.food, profile) : matchesConstraints(item.recipe, profile));

  if (picked) {
    return (
      <PortionEditor
        item={picked}
        slot={slot}
        dateKey={dateKey}
        onBack={() => setPicked(null)}
        onDone={(name) => {
          toast.show(`Logged ${name}`, { tone: 'success' });
          close();
        }}
      />
    );
  }
  if (creating) {
    return (
      <CustomFoodForm
        onBack={() => setCreating(false)}
        onCreated={(food) => {
          setCreating(false);
          setPicked({ kind: 'food', food });
        }}
      />
    );
  }

  return (
    <Sheet open={open} onClose={close} title="Add food">
      <div className="mb-3">
        <SegmentedControl
          options={(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((s) => ({ value: s, label: SLOT_LABEL[s] }))}
          value={slot}
          onChange={setSlot}
          columns={4}
        />
      </div>
      <div className="mb-3 flex rounded-xl bg-surface-2 p-1 text-sm">
        {(['search', 'recent', 'menu'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`flex-1 rounded-lg py-2 capitalize ${tab === t ? 'bg-surface font-semibold' : 'text-muted'}`}
            onClick={() => setTab(t)}
          >
            {t === 'menu' ? "Today's menu" : t}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <>
          <input
            type="search"
            autoFocus
            placeholder="Search 400+ foods and recipes"
            className="h-12 w-full rounded-xl border border-border bg-surface-2 px-4 outline-none focus:border-accent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.trim() === '' ? (
            <p className="mt-6 text-center text-sm text-muted">Type to search, e.g. "chicken", "oats", "latte".</p>
          ) : results.foods.length + results.recipes.length === 0 ? (
            <div className="mt-6 text-center text-sm text-muted">
              No match.{' '}
              <button type="button" className="text-accent" onClick={() => setCreating(true)}>
                Create "{query.trim()}" as a custom food
              </button>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-border/60">
              {results.recipes.map((r) => (
                <Row key={r.id} title={r.name} subtitle={`Recipe · ${fmt.kcal(r.macros.kcal)} per serving`} muted={!fits({ kind: 'recipe', recipe: r, scale: 1 })} onClick={() => setPicked({ kind: 'recipe', recipe: r, scale: 1 })} />
              ))}
              {results.foods.map((f) => (
                <Row
                  key={f.id}
                  title={f.name}
                  subtitle={`${f.isCustom ? 'Custom · ' : ''}${fmt.kcal(f.per100g.kcal)} / 100 g${f.servingLabel ? ` · ${f.servingLabel} = ${f.servingG} g` : ''}`}
                  muted={!fits({ kind: 'food', food: f })}
                  onClick={() => setPicked({ kind: 'food', food: f })}
                />
              ))}
            </ul>
          )}
          <button type="button" className="mt-4 h-11 w-full rounded-xl border border-dashed border-border text-sm text-accent" onClick={() => setCreating(true)}>
            + Create custom food
          </button>
        </>
      )}

      {tab === 'recent' && (
        <ul className="divide-y divide-border/60">
          {(recent ?? []).length === 0 && <p className="py-6 text-center text-sm text-muted">Foods you log will appear here.</p>}
          {(recent ?? []).map((r, i) => {
            const item = resolveSource(r.source);
            if (!item) return null;
            return <Row key={i} title={r.name} subtitle={`Last time: ${fmt.grams(r.grams)}`} onClick={() => setPicked(item.kind === 'food' ? { ...item, grams: r.grams } : item)} />;
          })}
        </ul>
      )}

      {tab === 'menu' && (
        <ul className="divide-y divide-border/60">
          {!menu?.meals.length && <p className="py-6 text-center text-sm text-muted">No menu for this day yet. Open the Menu tab to generate one.</p>}
          {menu?.meals.map((m, i) => {
            const r = m.inlineRecipe ?? RESOLVED_RECIPES_BY_ID.get(m.recipeId);
            if (!r) return null;
            return (
              <Row
                key={`${m.recipeId}-${i}`}
                title={r.name}
                subtitle={`${SLOT_LABEL[m.slot]} · ${fmt.kcal(m.macros.kcal)} · ${m.scale}× portion`}
                onClick={() => {
                  setSlot(m.slot);
                  setPicked({ kind: 'recipe', recipe: r, scale: m.scale });
                }}
              />
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}

function Row({ title, subtitle, muted, onClick }: { title: string; subtitle: string; muted?: boolean; onClick: () => void }) {
  return (
    <li>
      <button type="button" className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left active:bg-surface-2" onClick={onClick}>
        <div className="min-w-0">
          <div className={`truncate text-sm ${muted ? 'text-muted' : ''}`}>
            {title}
            {muted && <span className="ml-2 text-xs text-carbs">outside your preferences</span>}
          </div>
          <div className="text-xs text-muted">{subtitle}</div>
        </div>
        <span className="text-muted">›</span>
      </button>
    </li>
  );
}
