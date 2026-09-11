import type { FoodItem } from '@/domain/types';
import { db as defaultDb, type AppDB } from '../db';
import { newId } from '@/lib/ids';

export type CustomFoodDraft = Omit<FoodItem, 'id' | 'isCustom'>;

export function customFoodRepo(db: AppDB = defaultDb) {
  return {
    list: () => db.customFoods.orderBy('name').toArray(),

    async add(draft: CustomFoodDraft): Promise<FoodItem> {
      const food: FoodItem = { ...draft, id: `custom_${newId()}`, isCustom: true };
      await db.customFoods.add(food);
      return food;
    },

    update: (id: string, changes: Partial<CustomFoodDraft>) => db.customFoods.update(id, changes),

    remove: (id: string) => db.customFoods.delete(id),
  };
}
