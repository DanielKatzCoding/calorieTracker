// Bundled recipe database. Nutrition, allergens and diet compatibility are DERIVED from the
// ingredient foods (see domain/menu/nutrition.ts), so authors only list food ids and grams.
// Quantities describe one base serving; the menu generator scales them 0.5x-2x. Steps mention
// ingredients by name, never by grams, so they stay correct at any portion.
import type { Allergen, Cuisine, MealSlot, Recipe } from '@/domain/types';

type Ing = [foodId: string, grams: number];

function r(
  id: string,
  name: string,
  slots: MealSlot[],
  cuisine: Cuisine | 'neutral',
  ingredients: Ing[],
  prepMinutes: number,
  steps: string[],
  extra: { tip?: string; extraAllergens?: Allergen[] } = {},
): Recipe {
  return {
    id,
    name,
    slots,
    cuisine,
    ingredients: ingredients.map(([foodId, grams]) => ({ foodId, grams })),
    prepMinutes,
    steps,
    ...extra,
  };
}

const B: MealSlot[] = ['breakfast'];
const L: MealSlot[] = ['lunch'];
const D: MealSlot[] = ['dinner'];
const LD: MealSlot[] = ['lunch', 'dinner'];
const S: MealSlot[] = ['snack'];
const BS: MealSlot[] = ['breakfast', 'snack'];

export const RECIPES: Recipe[] = [
  // ================================================================ Breakfast
  r('oatmeal_banana_pb', 'Banana peanut butter oatmeal', B, 'american', [['oats', 50], ['oat_milk', 250], ['banana', 118], ['peanut_butter', 16], ['cinnamon', 2]], 10, [
    'Combine the oats and oat milk in a small pot and bring to a gentle simmer.',
    'Cook 4-5 minutes, stirring now and then, until thick and creamy.',
    'Pour into a bowl; top with sliced banana, a spoon of peanut butter and the cinnamon.',
  ]),
  r('overnight_oats_berries', 'Overnight oats with berries', B, 'neutral', [['oats', 50], ['soy_yogurt', 150], ['chia_seeds', 12], ['mixed_berries_frozen', 75], ['maple_syrup', 10]], 5, [
    'Stir the oats, soy yogurt, chia seeds and maple syrup together in a jar.',
    'Fold in the frozen berries, cover and refrigerate overnight (at least 4 hours).',
    'Loosen with a splash of water or plant milk in the morning if it is too thick.',
  ]),
  r('greek_yogurt_parfait', 'Greek yogurt granola parfait', B, 'american', [['greek_yogurt_0', 200], ['granola', 40], ['blueberries', 75], ['honey', 14]], 5, [
    'Spoon half the yogurt into a glass or bowl.',
    'Layer on half the granola and half the blueberries, then repeat.',
    'Drizzle the honey over the top and eat right away so the granola stays crunchy.',
  ]),
  r('scrambled_eggs_toast', 'Scrambled eggs on toast with spinach', B, 'neutral', [['egg', 150], ['bread_whole_wheat', 60], ['butter', 7], ['spinach', 40], ['tomato', 60]], 10, [
    'Toast the bread and halve the tomato.',
    'Melt the butter in a non-stick pan over medium-low heat and wilt the spinach for 1 minute.',
    'Whisk the eggs with a pinch of salt, pour in and stir slowly until just set and glossy.',
    'Pile the eggs onto the toast and serve with the tomato alongside.',
  ]),
  r('veggie_omelette', 'Veggie cheddar omelette', B, 'neutral', [['egg', 150], ['bell_pepper', 60], ['mushrooms', 50], ['onion', 30], ['cheddar', 28], ['olive_oil', 7]], 12, [
    'Dice the pepper, mushrooms and onion; grate the cheddar.',
    'Saute the vegetables in the olive oil over medium heat for 4-5 minutes until soft.',
    'Beat the eggs with salt and pepper, pour over the vegetables and cook until the base sets.',
    'Scatter the cheese on top, fold the omelette in half and cook 1 more minute.',
  ]),
  r('avocado_toast_egg', 'Avocado toast with egg', B, 'american', [['bread_sourdough', 80], ['avocado', 70], ['egg', 100], ['chili_flakes', 1], ['lemon_juice', 5]], 10, [
    'Toast the sourdough.',
    'Mash the avocado with the lemon juice and a pinch of salt; spread on the toast.',
    'Fry or poach the eggs to your liking and place on top.',
    'Finish with the chili flakes and black pepper.',
  ]),
  r('tofu_scramble', 'Tofu scramble with toast', B, 'american', [['tofu_firm', 200], ['spinach', 50], ['tomato', 80], ['onion', 40], ['nutritional_yeast', 10], ['turmeric', 2], ['olive_oil', 10], ['bread_whole_wheat', 60]], 15, [
    'Press the tofu briefly, then crumble it with your hands.',
    'Soften the diced onion in the olive oil for 3 minutes; add the turmeric and the tofu.',
    'Cook 5 minutes, stirring, then add the chopped tomato, spinach and nutritional yeast until the spinach wilts.',
    'Season well with salt and pepper and serve on the toasted bread.',
  ]),
  r('green_protein_smoothie', 'Green protein smoothie', BS, 'neutral', [['banana', 118], ['spinach', 40], ['pea_protein', 30], ['almond_milk', 250], ['peanut_butter', 16], ['chia_seeds', 12]], 5, [
    'Add the almond milk and spinach to a blender first and blend until smooth.',
    'Add the banana, pea protein, peanut butter and chia seeds and blend again for 30 seconds.',
    'Add ice or a little water to reach the thickness you like.',
  ]),
  r('berry_protein_smoothie', 'Berry whey smoothie', BS, 'neutral', [['mixed_berries_frozen', 150], ['greek_yogurt_0', 150], ['whey_protein', 30], ['milk_2', 200]], 5, [
    'Put the milk, yogurt and whey in a blender and blend briefly.',
    'Add the frozen berries and blend until completely smooth.',
  ]),
  r('pb_banana_toast', 'Peanut butter banana toast', B, 'american', [['bread_whole_wheat', 60], ['peanut_butter', 32], ['banana', 118]], 5, [
    'Toast the bread until golden.',
    'Spread the peanut butter on the warm toast and top with sliced banana.',
  ]),
  r('cottage_cheese_bowl', 'Cottage cheese with strawberries and walnuts', B, 'neutral', [['cottage_cheese', 200], ['strawberries', 100], ['walnuts', 20], ['honey', 10]], 5, [
    'Spoon the cottage cheese into a bowl.',
    'Top with halved strawberries and roughly chopped walnuts.',
    'Drizzle with the honey.',
  ]),
  r('shakshuka', 'Shakshuka with pita', B, 'middle_eastern', [['egg', 100], ['tomato_canned', 200], ['onion', 50], ['bell_pepper', 80], ['garlic', 6], ['olive_oil', 10], ['cumin', 2], ['paprika', 2], ['pita', 60]], 25, [
    'Soften the diced onion and pepper in the olive oil over medium heat for 6-8 minutes.',
    'Add the minced garlic, cumin and paprika and cook 1 minute.',
    'Pour in the canned tomatoes, season and simmer 10 minutes until thick.',
    'Make wells in the sauce, crack in the eggs, cover and cook 5-7 minutes until the whites set.',
    'Warm the pita and use it to scoop.',
  ]),
  r('keto_bacon_eggs', 'Bacon, eggs and avocado', B, 'american', [['egg', 150], ['bacon', 32], ['avocado', 70], ['spinach', 30], ['butter', 7]], 12, [
    'Fry the bacon in a dry pan until crisp; set aside on paper towel.',
    'Wilt the spinach in the bacon fat for 1 minute and move to the plate.',
    'Melt the butter and fry the eggs to your liking.',
    'Serve with sliced avocado, seasoned with salt and pepper.',
  ]),
  r('smoked_salmon_scramble', 'Smoked salmon cream cheese scramble', B, 'nordic', [['egg', 150], ['salmon_smoked', 60], ['cream_cheese', 30], ['green_onion', 10], ['butter', 7]], 10, [
    'Whisk the eggs with pepper and the sliced green onion.',
    'Melt the butter over low heat, add the eggs and stir slowly until softly set.',
    'Fold in small pieces of smoked salmon and dots of cream cheese; serve immediately.',
  ]),
  r('keto_chia_pudding', 'Coconut chia pudding with macadamia', BS, 'neutral', [['chia_seeds', 12], ['coconut_cream', 40], ['almond_milk', 150], ['raspberries', 20], ['macadamia', 20]], 5, [
    'Whisk the chia seeds into the almond milk and coconut cream.',
    'Rest 10 minutes, whisk again to break up clumps, then chill at least 2 hours or overnight.',
    'Top with the raspberries and chopped macadamia nuts.',
  ]),
  r('keto_yogurt_almonds', 'Full-fat Greek yogurt with almonds and blackberries', BS, 'neutral', [['greek_yogurt_full', 150], ['almonds', 25], ['blackberries', 30]], 3, [
    'Spoon the yogurt into a bowl.',
    'Top with the blackberries and roughly chopped almonds.',
  ]),
  r('zucchini_feta_frittata', 'Zucchini feta frittata', B, 'mediterranean', [['egg', 200], ['zucchini', 100], ['feta', 40], ['cherry_tomatoes', 60], ['olive_oil', 10]], 20, [
    'Grate the zucchini and squeeze out excess water; halve the tomatoes.',
    'Cook the zucchini in the olive oil in a small oven-safe pan for 3 minutes.',
    'Whisk the eggs with pepper, pour over, scatter the tomatoes and crumbled feta on top.',
    'Cook over low heat until the edges set, then finish under the grill 3-4 minutes until golden.',
  ]),
  r('almond_flour_pancakes', 'Almond flour pancakes with strawberries', B, 'american', [['almond_flour', 50], ['egg', 100], ['butter', 10], ['strawberries', 40]], 15, [
    'Whisk the eggs, then stir in the almond flour and a pinch of salt to make a thick batter.',
    'Melt a little of the butter in a non-stick pan over medium-low heat.',
    'Cook small pancakes 2 minutes per side until golden, adding butter as needed.',
    'Serve with the sliced strawberries.',
  ]),
  r('sausage_pepper_skillet', 'Sausage and pepper breakfast skillet', B, 'american', [['sausage_pork', 140], ['bell_pepper', 100], ['onion', 30], ['egg', 50], ['olive_oil', 5]], 15, [
    'Slice the sausage, pepper and onion.',
    'Brown the sausage in the oil for 5 minutes, then add the vegetables and cook 5 more.',
    'Crack the egg into the pan, cover and cook until the white is set.',
  ]),
  r('salmon_avocado_plate', 'Smoked salmon, avocado and egg plate', B, 'nordic', [['salmon_smoked', 80], ['avocado', 100], ['egg', 100], ['cucumber', 50]], 8, [
    'Boil the eggs for 7 minutes, cool under cold water and peel.',
    'Arrange the smoked salmon, sliced avocado, halved eggs and cucumber on a plate.',
    'Season with black pepper and a squeeze of lemon if you have it.',
  ]),
  r('cheese_mushroom_omelette', 'Cheese and mushroom omelette', B, 'neutral', [['egg', 150], ['cheddar', 40], ['butter', 10], ['mushrooms', 60], ['spinach', 30]], 10, [
    'Slice the mushrooms and cook them in half the butter until golden; add the spinach to wilt.',
    'Beat the eggs with salt and pepper; melt the rest of the butter and pour the eggs in.',
    'When the base is set, add the mushrooms, spinach and grated cheddar, fold and serve.',
  ]),
  r('protein_pancakes', 'Oat protein pancakes', B, 'american', [['oats', 40], ['egg', 100], ['banana', 60], ['whey_protein', 20], ['greek_yogurt_0', 50]], 15, [
    'Blend the oats, eggs, banana and whey protein into a smooth batter.',
    'Cook small pancakes in a lightly oiled non-stick pan, 2 minutes per side.',
    'Stack and top with the Greek yogurt.',
  ]),
  r('bagel_salmon', 'Bagel with cream cheese and smoked salmon', B, 'american', [['bagel', 90], ['cream_cheese', 30], ['salmon_smoked', 60], ['cucumber', 40]], 5, [
    'Halve and toast the bagel.',
    'Spread with the cream cheese and layer on the smoked salmon and thin cucumber slices.',
    'Add black pepper and a squeeze of lemon if you like.',
  ]),
  r('muesli_soy_yogurt', 'Muesli with soy yogurt and apple', B, 'nordic', [['muesli', 50], ['soy_yogurt', 150], ['apple', 100]], 3, [
    'Spoon the soy yogurt into a bowl and stir in the muesli.',
    'Top with the diced apple.',
  ]),
  r('vegan_breakfast_burrito', 'Vegan breakfast burrito', B, 'mexican', [['tortilla_flour', 45], ['black_beans_cooked', 100], ['tofu_firm', 100], ['salsa', 30], ['avocado', 50], ['spinach', 20]], 12, [
    'Crumble the tofu into a hot pan with a little oil, season with salt, cumin and paprika and cook 5 minutes.',
    'Stir in the black beans and spinach until warm.',
    'Warm the tortilla, fill with the tofu mixture, salsa and sliced avocado, then roll tightly.',
  ]),
  r('apple_walnut_oats', 'Apple walnut oatmeal', B, 'neutral', [['oats', 50], ['almond_milk', 250], ['apple', 100], ['walnuts', 20], ['cinnamon', 2]], 10, [
    'Simmer the oats in the almond milk with the cinnamon for 5 minutes.',
    'Stir in half the diced apple during the last minute.',
    'Top with the remaining apple and the chopped walnuts.',
  ]),
  r('tempeh_hash', 'Tempeh potato hash', B, 'american', [['tempeh', 100], ['potato', 150], ['bell_pepper', 60], ['onion', 40], ['olive_oil', 10], ['paprika', 2]], 20, [
    'Dice the boiled potato, tempeh, pepper and onion.',
    'Fry the potato and tempeh in the olive oil over medium-high heat for 8 minutes until crisp.',
    'Add the pepper, onion and paprika; cook 5 more minutes and season with salt.',
  ]),
  r('vegan_protein_oats', 'Blueberry protein oats', B, 'neutral', [['oats', 50], ['pea_protein', 30], ['soy_milk', 250], ['blueberries', 75]], 8, [
    'Cook the oats in the soy milk for 5 minutes and take off the heat.',
    'Stir in the pea protein until smooth, loosening with a splash of water if needed.',
    'Top with the blueberries.',
  ]),
  r('labneh_pita_plate', 'Labneh and pita breakfast plate', B, 'middle_eastern', [['labneh', 60], ['pita', 60], ['cucumber', 60], ['tomato', 80], ['olive_oil', 7], ['zaatar', 3]], 5, [
    "Spread the labneh on a plate, drizzle with the olive oil and sprinkle with za'atar.",
    'Warm the pita and slice the cucumber and tomato.',
    'Scoop the labneh with the pita and eat with the vegetables.',
  ]),
  r('egg_white_wrap', 'Egg white spinach feta wrap', B, 'mediterranean', [['egg_white', 150], ['wrap_whole_wheat', 60], ['spinach', 30], ['tomato', 50], ['feta', 20]], 10, [
    'Cook the egg whites in a lightly oiled pan, stirring, until just set; season with pepper.',
    'Warm the wrap, lay on the spinach, diced tomato, crumbled feta and the egg whites.',
    'Fold in the sides and roll up tightly.',
  ]),
  r('rice_cakes_cottage_cheese', 'Rice cakes with cottage cheese and tomato', B, 'neutral', [['rice_cakes', 36], ['cottage_cheese', 150], ['tomato', 80], ['black_pepper', 1]], 5, [
    'Spread the cottage cheese over the rice cakes.',
    'Top with sliced tomato and plenty of black pepper.',
  ]),
  r('coconut_mango_oats', 'Coconut yogurt mango overnight oats', B, 'neutral', [['oats', 50], ['coconut_yogurt', 150], ['chia_seeds', 12], ['mango', 100], ['maple_syrup', 10]], 5, [
    'Mix the oats, coconut yogurt, chia seeds and maple syrup in a jar.',
    'Refrigerate overnight.',
    'Top with the diced mango before eating.',
  ]),
  r('berry_seed_oats', 'Berry oatmeal with pumpkin seeds', B, 'neutral', [['oats', 50], ['oat_milk', 250], ['mixed_berries_frozen', 100], ['pumpkin_seeds', 15], ['maple_syrup', 10]], 10, [
    'Simmer the oats in the oat milk for 5 minutes.',
    'Stir in the frozen berries and cook 1 more minute until they release their juice.',
    'Finish with the pumpkin seeds and maple syrup.',
  ]),

  // ================================================================ Lunch
  r('chicken_rice_bowl', 'Chicken, brown rice and broccoli bowl', LD, 'asian', [['chicken_breast', 150], ['rice_brown_cooked', 180], ['broccoli', 100], ['olive_oil', 7], ['tamari', 15]], 20, [
    'Cut the chicken into strips and season with salt and pepper.',
    'Sear in the olive oil over high heat for 6-7 minutes until cooked through.',
    'Steam or microwave the broccoli florets for 3 minutes.',
    'Serve over the warm rice and drizzle everything with the tamari.',
  ]),
  r('tuna_salad_sandwich', 'Tuna salad sandwich', L, 'american', [['tuna_canned', 120], ['mayonnaise', 20], ['bread_whole_wheat', 60], ['lettuce_romaine', 30], ['tomato', 50]], 8, [
    'Drain the tuna and mix with the mayonnaise, salt and pepper.',
    'Toast the bread if you like, then layer lettuce, sliced tomato and the tuna salad.',
    'Close the sandwich and cut in half.',
  ]),
  r('quinoa_chickpea_feta_salad', 'Quinoa chickpea feta salad', L, 'mediterranean', [['quinoa_cooked', 150], ['chickpeas_cooked', 120], ['cucumber', 80], ['cherry_tomatoes', 100], ['feta', 30], ['olive_oil', 10], ['lemon_juice', 15], ['parsley', 5]], 12, [
    'Dice the cucumber and halve the tomatoes; chop the parsley.',
    'Toss with the quinoa and rinsed chickpeas.',
    'Dress with olive oil, lemon juice, salt and pepper, then crumble the feta over.',
  ]),
  r('lentil_soup', 'Lentil vegetable soup with sourdough', LD, 'mediterranean', [['lentils_cooked', 250], ['carrot', 60], ['onion', 50], ['celery', 40], ['tomato_canned', 100], ['olive_oil', 10], ['cumin', 2], ['vegetable_broth', 240], ['bread_sourdough', 40]], 30, [
    'Dice the onion, carrot and celery and soften in the olive oil for 8 minutes.',
    'Add the cumin, canned tomatoes, lentils and broth; simmer 15 minutes.',
    'Season with salt, pepper and a squeeze of lemon; blend half if you like it thicker.',
    'Serve with the sourdough.',
  ]),
  r('turkey_avocado_wrap', 'Turkey avocado wrap', L, 'american', [['wrap_whole_wheat', 60], ['deli_turkey', 84], ['avocado', 50], ['lettuce_romaine', 30], ['tomato', 50], ['mustard', 5]], 6, [
    'Spread the mustard and mashed avocado over the wrap.',
    'Layer the turkey, lettuce and sliced tomato.',
    'Fold in the sides and roll tightly; cut in half.',
  ]),
  r('falafel_pita', 'Falafel pita with hummus and tahini', L, 'middle_eastern', [['pita', 60], ['falafel', 100], ['hummus', 60], ['tomato', 60], ['cucumber', 60], ['tahini', 15], ['lettuce_romaine', 20]], 10, [
    'Warm the falafel in the oven or a pan until hot and crisp.',
    'Warm the pita, split it open and spread the hummus inside.',
    'Fill with the falafel, diced tomato, cucumber and lettuce.',
    'Thin the tahini with a little water and lemon and drizzle over.',
  ]),
  r('salmon_rice_bowl', 'Salmon, edamame and avocado rice bowl', LD, 'asian', [['salmon', 120], ['rice_white_cooked', 150], ['edamame', 60], ['avocado', 50], ['cucumber', 60], ['tamari', 15], ['sesame_seeds', 5]], 20, [
    'Season the salmon and pan-fry skin-side down 4 minutes, then 3 minutes on the other side.',
    'Warm the rice and the edamame.',
    'Build the bowl: rice, flaked salmon, edamame, sliced avocado and cucumber.',
    'Drizzle with tamari and sprinkle with sesame seeds.',
  ]),
  r('chicken_caesar_salad', 'Chicken Caesar salad', L, 'american', [['chicken_breast', 130], ['lettuce_romaine', 120], ['parmesan', 15], ['caesar_dressing', 30], ['bread_whole_wheat', 30]], 12, [
    'Cube the bread and toast in a dry pan until crisp to make croutons.',
    'Season and grill or pan-fry the chicken 6-7 minutes per side; rest and slice.',
    'Toss the chopped romaine with the dressing, top with chicken, croutons and parmesan.',
  ]),
  r('veggie_burrito_bowl', 'Veggie burrito bowl', LD, 'mexican', [['rice_brown_cooked', 150], ['black_beans_cooked', 130], ['corn', 60], ['salsa', 40], ['avocado', 60], ['lettuce_romaine', 40], ['lime', 10]], 12, [
    'Warm the rice and black beans; season the beans with cumin and salt.',
    'Layer rice, beans, corn and shredded lettuce in a bowl.',
    'Top with salsa and sliced avocado and squeeze the lime over.',
  ]),
  r('beef_burrito', 'Beef and bean burrito', LD, 'mexican', [['tortilla_flour', 60], ['beef_ground_90', 100], ['refried_beans', 80], ['cheddar', 28], ['salsa', 30], ['lettuce_romaine', 30]], 15, [
    'Brown the beef with cumin, paprika and salt for 6-8 minutes.',
    'Warm the refried beans and the tortilla.',
    'Spread the beans on the tortilla, add the beef, grated cheddar, salsa and lettuce.',
    'Fold the sides in and roll; toast the burrito seam-side down for 1 minute.',
  ]),
  r('greek_chicken_salad', 'Greek salad with grilled chicken', LD, 'mediterranean', [['chicken_breast', 120], ['cucumber', 100], ['tomato', 120], ['red_onion', 30], ['olives', 30], ['feta', 40], ['olive_oil', 10], ['oregano', 1]], 15, [
    'Season the chicken with oregano, salt and pepper and grill or pan-fry 6-7 minutes per side.',
    'Chop the cucumber and tomato; thinly slice the red onion.',
    'Toss the vegetables with the olives, olive oil and a splash of vinegar.',
    'Top with sliced chicken and the feta in one block or crumbled.',
  ]),
  r('tofu_stir_fry_rice', 'Tofu vegetable stir-fry with brown rice', LD, 'asian', [['tofu_firm', 150], ['stir_fry_vegetables', 200], ['rice_brown_cooked', 150], ['tamari', 15], ['sesame_oil', 7], ['ginger', 5], ['garlic', 6]], 20, [
    'Press and cube the tofu; fry in the sesame oil over high heat until golden on all sides.',
    'Add the grated ginger and minced garlic for 30 seconds, then the vegetables.',
    'Stir-fry 4-5 minutes, add the tamari and toss.',
    'Serve over the warm brown rice.',
  ]),
  r('shrimp_noodle_stir_fry', 'Shrimp rice-noodle stir-fry', LD, 'asian', [['shrimp', 150], ['noodles_rice', 150], ['stir_fry_vegetables', 150], ['tamari', 15], ['sesame_oil', 7], ['garlic', 6]], 18, [
    'Soak or boil the rice noodles per the package and drain.',
    'Stir-fry the garlic in the sesame oil for 30 seconds, then the vegetables for 3 minutes.',
    'Add the shrimp and cook 2-3 minutes until pink.',
    'Toss in the noodles and tamari and heat through.',
  ]),
  r('caprese_sandwich', 'Caprese sandwich', L, 'italian', [['bread_sourdough', 80], ['mozzarella_fresh', 80], ['tomato', 100], ['basil', 5], ['olive_oil', 7], ['balsamic_vinegar', 10]], 6, [
    'Slice the mozzarella and tomato.',
    'Layer them on the bread with the basil leaves.',
    'Drizzle with olive oil and balsamic, season with salt and pepper and close.',
  ]),
  r('egg_salad_sandwich', 'Egg salad on rye', L, 'american', [['egg', 150], ['mayonnaise', 20], ['mustard', 5], ['bread_rye', 64], ['lettuce_romaine', 30]], 10, [
    'Boil the eggs 9 minutes, cool, peel and chop.',
    'Mix with the mayonnaise, mustard, salt and pepper.',
    'Pile onto the rye with the lettuce and close the sandwich.',
  ]),
  r('lentil_pasta_marinara', 'Lentil pasta with marinara and spinach', LD, 'italian', [['pasta_lentil_cooked', 200], ['tomato_sauce', 150], ['spinach', 50], ['olive_oil', 7], ['nutritional_yeast', 10]], 15, [
    'Cook the lentil pasta per the package and drain.',
    'Warm the tomato sauce with the olive oil; stir in the spinach until wilted.',
    'Toss the pasta in the sauce and finish with the nutritional yeast.',
  ]),
  r('chicken_shawarma_plate', 'Chicken shawarma plate', LD, 'middle_eastern', [['chicken_thigh', 150], ['rice_basmati_cooked', 150], ['hummus', 40], ['tomato', 60], ['cucumber', 60], ['pickles', 30], ['tahini', 10]], 25, [
    'Rub the chicken with cumin, paprika, turmeric, garlic, salt and a little oil; marinate 10 minutes if you can.',
    'Pan-fry or grill the chicken 6 minutes per side until charred and cooked through; rest and slice.',
    'Plate the rice, chicken, hummus, diced tomato and cucumber and the pickles.',
    'Thin the tahini with water and lemon and drizzle over.',
  ]),
  r('sabich_pita', 'Sabich pita (eggplant and egg)', L, 'middle_eastern', [['pita', 60], ['eggplant', 100], ['egg', 50], ['hummus', 40], ['tahini', 15], ['tomato', 60], ['cucumber', 50], ['pickles', 20], ['olive_oil', 10]], 20, [
    'Slice the eggplant, brush with the olive oil and fry or roast until soft and browned.',
    'Boil the egg 9 minutes, peel and slice.',
    'Spread the hummus in the warm pita and fill with eggplant, egg, diced tomato, cucumber and pickles.',
    'Drizzle with the thinned tahini.',
  ]),
  r('hummus_veggie_plate', 'Hummus and veggie mezze plate', L, 'middle_eastern', [['hummus', 100], ['pita', 60], ['carrot', 80], ['cucumber', 100], ['bell_pepper', 80], ['olives', 30]], 5, [
    'Cut the carrot, cucumber and pepper into sticks.',
    'Warm the pita and cut into wedges.',
    'Arrange everything around the hummus and olives.',
  ]),
  r('chicken_noodle_soup', 'Chicken noodle soup', LD, 'american', [['chicken_breast', 100], ['noodles_egg', 100], ['carrot', 60], ['celery', 40], ['onion', 40], ['chicken_broth', 480]], 30, [
    'Dice the carrot, celery and onion and simmer in the broth for 10 minutes.',
    'Add the chicken and simmer 12 minutes; lift it out, shred and return to the pot.',
    'Add the noodles and cook until tender; season with salt, pepper and parsley.',
  ]),
  r('keto_tuna_avocado_salad', 'Tuna avocado salad', L, 'american', [['tuna_canned', 120], ['avocado', 100], ['mayonnaise', 15], ['celery', 40], ['lemon_juice', 10], ['mixed_greens', 60]], 8, [
    'Drain the tuna and mash with the avocado, mayonnaise and lemon juice.',
    'Fold in the finely diced celery and season with salt and pepper.',
    'Serve over the mixed greens.',
  ]),
  r('keto_chicken_caesar', 'Chicken Caesar with bacon (no croutons)', LD, 'american', [['chicken_breast', 150], ['lettuce_romaine', 120], ['parmesan', 20], ['caesar_dressing', 40], ['bacon', 16]], 15, [
    'Fry the bacon until crisp and crumble it.',
    'Season and grill or pan-fry the chicken 6-7 minutes per side; rest and slice.',
    'Toss the chopped romaine with the dressing, then top with chicken, bacon and parmesan.',
  ]),
  r('cobb_salad', 'Cobb salad', LD, 'american', [['chicken_breast', 120], ['egg', 50], ['bacon', 16], ['avocado', 70], ['mixed_greens', 80], ['cherry_tomatoes', 60], ['ranch_dressing', 30], ['cheddar', 20]], 15, [
    'Boil the egg 9 minutes; fry the bacon until crisp; cook the seasoned chicken 6-7 minutes per side.',
    'Spread the greens on a plate and arrange rows of sliced chicken, chopped egg, bacon, avocado, halved tomatoes and cheddar.',
    'Drizzle with the ranch dressing.',
  ]),
  r('egg_salad_lettuce_cups', 'Egg salad lettuce cups with avocado', L, 'neutral', [['egg', 150], ['mayonnaise', 25], ['mustard', 5], ['celery', 30], ['lettuce_romaine', 80], ['avocado', 50]], 10, [
    'Boil the eggs 9 minutes, cool, peel and chop.',
    'Mix with the mayonnaise, mustard, diced celery, salt and pepper.',
    'Spoon into romaine leaves and top with diced avocado.',
  ]),
  r('keto_tofu_bowl', 'Sesame tofu and cauliflower-rice bowl', LD, 'asian', [['tofu_firm', 200], ['cauliflower_rice', 80], ['avocado', 50], ['tamari', 10], ['sesame_oil', 10]], 15, [
    'Press and cube the tofu; fry in the sesame oil over high heat until crisp, then splash with the tamari.',
    'Saute the cauliflower rice in the same pan for 3 minutes.',
    'Serve the tofu on the cauliflower rice with sliced avocado.',
  ]),
  r('tempeh_kale_bowl', 'Lemon tempeh and kale bowl', LD, 'neutral', [['tempeh', 100], ['kale', 60], ['olive_oil', 15], ['lemon_juice', 5], ['hemp_seeds', 10]], 12, [
    'Slice the tempeh and pan-fry in two-thirds of the olive oil until golden on both sides.',
    'Add the torn kale with a splash of water and cook 2-3 minutes until tender.',
    'Dress with the remaining oil, lemon juice and salt; scatter the hemp seeds over.',
  ]),
  r('halloumi_salad', 'Grilled halloumi salad', LD, 'mediterranean', [['halloumi', 100], ['mixed_greens', 80], ['cucumber', 80], ['olives', 30], ['olive_oil', 10], ['cherry_tomatoes', 60]], 10, [
    'Slice the halloumi and grill or pan-fry in a dry pan until golden on both sides.',
    'Toss the greens, sliced cucumber, halved tomatoes and olives with the olive oil and a squeeze of lemon.',
    'Top with the hot halloumi.',
  ]),
  r('salmon_asparagus_butter', 'Lemon butter salmon with asparagus', LD, 'nordic', [['salmon', 150], ['asparagus', 120], ['butter', 10], ['lemon_juice', 10], ['garlic', 3]], 18, [
    'Season the salmon and pan-fry skin-side down 4 minutes, then flip for 3 minutes.',
    'Steam or pan-cook the trimmed asparagus for 4 minutes.',
    'Melt the butter with the minced garlic and lemon juice and spoon over the salmon and asparagus.',
  ]),
  r('chicken_pesto_pasta', 'Chicken pesto pasta', LD, 'italian', [['pasta_whole_wheat_cooked', 200], ['chicken_breast', 120], ['pesto', 30], ['cherry_tomatoes', 80], ['spinach', 30]], 20, [
    'Cook the pasta per the package; reserve a little cooking water.',
    'Cube the chicken, season and pan-fry 6-7 minutes until cooked.',
    'Toss the pasta with the pesto, chicken, halved tomatoes and spinach, loosening with the pasta water.',
  ]),
  r('black_bean_quinoa_salad', 'Black bean quinoa salad', LD, 'mexican', [['quinoa_cooked', 150], ['black_beans_cooked', 120], ['corn', 60], ['bell_pepper', 60], ['red_onion', 20], ['cilantro', 5], ['lime', 15], ['olive_oil', 10]], 12, [
    'Dice the pepper and red onion; chop the cilantro.',
    'Combine with the quinoa, rinsed black beans and corn.',
    'Dress with olive oil, lime juice, cumin and salt.',
  ]),
  r('buddha_bowl', 'Sweet potato chickpea Buddha bowl', LD, 'neutral', [['sweet_potato', 150], ['chickpeas_cooked', 120], ['kale', 60], ['quinoa_cooked', 100], ['tahini', 15], ['lemon_juice', 10], ['avocado', 50]], 30, [
    'Cube the sweet potato, toss with a little oil and salt and roast at 220 C for 25 minutes.',
    'Roast the chickpeas alongside for the last 15 minutes with paprika.',
    'Massage the kale with a pinch of salt; whisk the tahini with lemon juice and water.',
    'Assemble quinoa, sweet potato, chickpeas, kale and avocado and drizzle with the tahini sauce.',
  ]),
  r('sardine_rye_toast', 'Sardines on rye with tomato', L, 'nordic', [['sardines', 90], ['bread_rye', 64], ['tomato', 80], ['red_onion', 20], ['lemon_juice', 5]], 6, [
    'Toast the rye bread.',
    'Top with sliced tomato and the drained sardines.',
    'Add thin slices of red onion, a squeeze of lemon and black pepper.',
  ]),
  r('turkey_chili', 'Turkey and bean chili', LD, 'american', [['ground_turkey', 120], ['kidney_beans_cooked', 150], ['tomato_canned', 150], ['onion', 50], ['bell_pepper', 60], ['cumin', 2], ['chili_flakes', 1], ['olive_oil', 7]], 35, [
    'Soften the diced onion and pepper in the olive oil for 5 minutes.',
    'Add the turkey and brown for 6-8 minutes, breaking it up.',
    'Stir in the cumin, chili flakes, canned tomatoes and kidney beans; simmer 15-20 minutes.',
    'Season with salt and serve, optionally with a squeeze of lime.',
  ]),
  r('dal_rice', 'Lentil dal with basmati rice', LD, 'indian', [['lentils_cooked', 200], ['rice_basmati_cooked', 150], ['onion', 40], ['tomato', 80], ['garlic', 6], ['ginger', 5], ['curry_powder', 6], ['coconut_oil', 10], ['cilantro', 5]], 30, [
    'Fry the diced onion in the coconut oil until golden, about 6 minutes.',
    'Add the garlic, ginger and curry powder and cook 1 minute.',
    'Add the chopped tomato and lentils with a splash of water; simmer 10 minutes.',
    'Season with salt, top with cilantro and serve with the basmati rice.',
  ]),
  r('vegan_sushi_bowl', 'Vegan sushi bowl', L, 'asian', [['rice_white_cooked', 150], ['tofu_firm', 100], ['avocado', 60], ['cucumber', 60], ['carrot', 40], ['seaweed_nori', 3], ['tamari', 15], ['sesame_seeds', 5]], 15, [
    'Season the warm rice with a splash of rice vinegar.',
    'Pan-fry cubed tofu until golden and toss with half the tamari.',
    'Top the rice with tofu, sliced avocado, cucumber, julienned carrot and torn nori.',
    'Drizzle the remaining tamari and sprinkle with sesame seeds.',
  ]),
  r('chicken_hummus_wrap', 'Chicken hummus wrap', L, 'middle_eastern', [['wrap_whole_wheat', 60], ['chicken_breast', 120], ['hummus', 40], ['cucumber', 50], ['tomato', 50], ['lettuce_romaine', 20]], 8, [
    'Cook the seasoned chicken 6-7 minutes per side (or use leftovers) and slice.',
    'Spread the hummus over the warm wrap.',
    'Add the chicken, sliced cucumber, tomato and lettuce; roll tightly and cut in half.',
  ]),

  // ================================================================ Dinner
  r('chicken_sweet_potato_beans', 'Grilled chicken, sweet potato and green beans', D, 'american', [['chicken_breast', 170], ['sweet_potato', 200], ['green_beans', 120], ['olive_oil', 10]], 30, [
    'Prick the sweet potato and bake at 200 C for 40 minutes (or microwave 8 minutes).',
    'Rub the chicken with half the oil, salt, pepper and paprika; grill or pan-fry 7 minutes per side.',
    'Steam the green beans 5 minutes and toss with the remaining oil.',
  ]),
  r('salmon_quinoa_broccoli', 'Baked salmon with quinoa and broccoli', D, 'nordic', [['salmon', 150], ['quinoa_cooked', 150], ['broccoli', 120], ['olive_oil', 7], ['lemon_juice', 10]], 25, [
    'Place the salmon and broccoli florets on a tray, drizzle with the oil and season.',
    'Bake at 200 C for 12-14 minutes until the salmon flakes.',
    'Serve on the quinoa with the lemon juice squeezed over.',
  ]),
  r('beef_stir_fry', 'Beef and vegetable stir-fry with rice', D, 'asian', [['beef_sirloin', 150], ['stir_fry_vegetables', 200], ['rice_white_cooked', 150], ['tamari', 15], ['sesame_oil', 7], ['garlic', 6], ['ginger', 5]], 20, [
    'Slice the beef thinly against the grain and toss with half the tamari.',
    'Sear the beef in the sesame oil over very high heat for 2 minutes; remove.',
    'Stir-fry the garlic, ginger and vegetables for 4 minutes, return the beef and add the rest of the tamari.',
    'Serve over the rice.',
  ]),
  r('spaghetti_bolognese', 'Spaghetti bolognese', D, 'italian', [['pasta_cooked', 200], ['beef_ground_90', 120], ['tomato_sauce', 150], ['onion', 40], ['garlic', 6], ['olive_oil', 7], ['parmesan', 10]], 30, [
    'Soften the diced onion and garlic in the olive oil for 5 minutes.',
    'Add the beef and brown for 6-8 minutes.',
    'Pour in the tomato sauce, season and simmer 15 minutes.',
    'Toss with the cooked spaghetti and finish with parmesan.',
  ]),
  r('chicken_curry_rice', 'Coconut chicken curry with basmati', D, 'indian', [['chicken_thigh', 150], ['coconut_milk', 80], ['curry_paste', 20], ['onion', 50], ['bell_pepper', 80], ['rice_basmati_cooked', 150], ['coconut_oil', 7]], 30, [
    'Cube the chicken; slice the onion and pepper.',
    'Fry the curry paste in the coconut oil for 1 minute, add the onion and cook 4 minutes.',
    'Add the chicken and brown 5 minutes, then the pepper and coconut milk; simmer 12 minutes.',
    'Season with salt and serve with the basmati rice.',
  ]),
  r('baked_cod_potatoes', 'Baked cod with potatoes and asparagus', D, 'nordic', [['cod', 180], ['potato', 200], ['asparagus', 100], ['olive_oil', 10], ['lemon_juice', 10], ['dill', 3]], 30, [
    'Halve the boiled potatoes, toss with half the oil and roast at 220 C for 15 minutes.',
    'Add the cod and asparagus to the tray, drizzle with the remaining oil and season.',
    'Roast 12 more minutes until the cod flakes; finish with lemon juice and chopped dill.',
  ]),
  r('turkey_meatballs_pasta', 'Turkey meatballs with whole-wheat pasta', D, 'italian', [['ground_turkey', 150], ['breadcrumbs', 20], ['egg', 25], ['tomato_sauce', 150], ['pasta_whole_wheat_cooked', 180], ['parmesan', 10]], 35, [
    'Mix the turkey with the breadcrumbs, egg, salt, pepper and oregano; roll into 8 meatballs.',
    'Brown the meatballs in a little oil for 6 minutes, turning.',
    'Add the tomato sauce and simmer 12 minutes until cooked through.',
    'Serve over the pasta with parmesan.',
  ]),
  r('lentil_bolognese', 'Lentil bolognese', D, 'italian', [['pasta_whole_wheat_cooked', 200], ['lentils_cooked', 150], ['tomato_sauce', 150], ['onion', 40], ['carrot', 40], ['garlic', 6], ['olive_oil', 10]], 30, [
    'Finely dice the onion and carrot and soften in the olive oil with the garlic for 8 minutes.',
    'Add the lentils and tomato sauce, season and simmer 15 minutes.',
    'Toss with the cooked pasta.',
  ]),
  r('tofu_spinach_curry', 'Tofu spinach curry with brown rice', D, 'indian', [['tofu_firm', 200], ['coconut_milk', 80], ['curry_paste', 20], ['spinach', 80], ['tomato', 80], ['onion', 40], ['rice_brown_cooked', 150]], 25, [
    'Cube the tofu and fry in a little oil until golden; set aside.',
    'Fry the curry paste and diced onion for 4 minutes, add the chopped tomato and coconut milk and simmer 5 minutes.',
    'Return the tofu, stir in the spinach until wilted and season.',
    'Serve with the brown rice.',
  ]),
  r('chickpea_coconut_curry', 'Chickpea coconut curry', D, 'indian', [['chickpeas_cooked', 200], ['coconut_milk', 100], ['tomato_canned', 150], ['onion', 50], ['curry_powder', 6], ['garlic', 6], ['ginger', 5], ['rice_basmati_cooked', 150], ['cilantro', 5]], 30, [
    'Fry the diced onion in a little oil until golden, then add the garlic, ginger and curry powder for 1 minute.',
    'Add the canned tomatoes, chickpeas and coconut milk; simmer 15 minutes.',
    'Season with salt and lime, top with cilantro and serve with the rice.',
  ]),
  r('black_bean_tacos', 'Black bean tacos', D, 'mexican', [['tortilla_corn', 78], ['black_beans_cooked', 150], ['avocado', 60], ['salsa', 40], ['cabbage', 50], ['lime', 10], ['cilantro', 5]], 15, [
    'Warm the black beans with cumin, garlic powder and salt, mashing some of them.',
    'Shred the cabbage and toss with lime juice and salt.',
    'Heat the tortillas in a dry pan and fill with beans, cabbage, salsa, avocado and cilantro.',
  ]),
  r('chicken_fajitas', 'Chicken fajitas', D, 'mexican', [['tortilla_flour', 90], ['chicken_breast', 150], ['bell_pepper', 120], ['onion', 80], ['olive_oil', 10], ['paprika', 2], ['cumin', 2], ['sour_cream', 30]], 25, [
    'Slice the chicken, pepper and onion into strips; toss with the oil, paprika, cumin and salt.',
    'Cook in a very hot pan for 8-10 minutes until charred and the chicken is done.',
    'Warm the tortillas and fill with the mixture and a spoon of sour cream.',
  ]),
  r('pizza_night', 'Cheese pizza with side salad', D, 'italian', [['pizza_cheese', 214], ['mixed_greens', 60], ['vinaigrette', 15]], 15, [
    'Heat the pizza per the package (or reheat leftover slices in a hot pan until crisp).',
    'Toss the greens with the vinaigrette and serve alongside.',
  ]),
  r('shrimp_garlic_pasta', 'Garlic shrimp pasta', D, 'italian', [['shrimp', 150], ['pasta_cooked', 200], ['garlic', 9], ['olive_oil', 15], ['cherry_tomatoes', 100], ['parsley', 5], ['chili_flakes', 1]], 20, [
    'Cook the pasta; reserve a cup of the water.',
    'Gently fry the sliced garlic and chili flakes in the olive oil for 1 minute.',
    'Add the halved tomatoes for 3 minutes, then the shrimp for 2-3 minutes until pink.',
    'Toss with the pasta, a splash of pasta water and the chopped parsley.',
  ]),
  r('steak_baked_potato', 'Sirloin steak with baked potato and salad', D, 'american', [['beef_sirloin', 180], ['potato_baked', 200], ['mixed_greens', 60], ['vinaigrette', 20], ['butter', 7]], 30, [
    'Bake the potato at 200 C for 45-50 minutes (or microwave 8 minutes then crisp in the oven).',
    'Pat the steak dry, season generously and sear in a very hot pan 3-4 minutes per side; rest 5 minutes.',
    'Split the potato and add the butter; dress the greens with the vinaigrette.',
  ]),
  r('pork_apple_brussels', 'Pork tenderloin with apple, rice and Brussels sprouts', D, 'nordic', [['pork_tenderloin', 150], ['apple', 100], ['rice_brown_cooked', 150], ['brussels_sprouts', 120], ['olive_oil', 10]], 35, [
    'Halve the sprouts, toss with half the oil and roast at 220 C for 20 minutes.',
    'Season the pork and sear in the remaining oil for 3 minutes per side; add the sliced apple and roast 10 minutes.',
    'Rest the pork 5 minutes, slice and serve with the apple, sprouts and rice.',
  ]),
  r('tempeh_noodle_stir_fry', 'Tempeh and vegetable rice-noodle stir-fry', D, 'asian', [['tempeh', 150], ['stir_fry_vegetables', 200], ['noodles_rice', 150], ['tamari', 15], ['sesame_oil', 7], ['garlic', 6]], 20, [
    'Soak or boil the rice noodles per the package.',
    'Cube the tempeh and fry in the sesame oil until golden; add the garlic for 30 seconds.',
    'Add the vegetables and stir-fry 4 minutes, then the noodles and tamari; toss to coat.',
  ]),
  r('vegan_chili', 'Three-bean vegan chili with avocado', D, 'mexican', [['kidney_beans_cooked', 150], ['black_beans_cooked', 100], ['tomato_canned', 200], ['onion', 50], ['bell_pepper', 80], ['corn', 60], ['cumin', 3], ['chili_flakes', 1], ['olive_oil', 10], ['avocado', 50]], 35, [
    'Soften the diced onion and pepper in the olive oil for 6 minutes.',
    'Add the cumin and chili flakes, then the tomatoes, beans and corn.',
    'Simmer 20 minutes until thick; season with salt and lime.',
    'Serve topped with diced avocado.',
  ]),
  r('mushroom_barley_risotto', 'Mushroom barley risotto', D, 'italian', [['barley_cooked', 200], ['mushrooms', 150], ['onion', 40], ['garlic', 6], ['vegetable_broth', 200], ['olive_oil', 10], ['nutritional_yeast', 10], ['parsley', 5]], 40, [
    'Fry the sliced mushrooms in half the oil until browned; set aside.',
    'Soften the diced onion and garlic in the remaining oil, add the barley and broth and simmer 10 minutes until creamy.',
    'Stir in the mushrooms and nutritional yeast, season and finish with chopped parsley.',
  ]),
  r('stuffed_peppers', 'Quinoa black bean stuffed peppers', D, 'mexican', [['bell_pepper', 240], ['quinoa_cooked', 150], ['black_beans_cooked', 100], ['tomato_sauce', 80], ['onion', 30], ['cumin', 2], ['olive_oil', 7]], 45, [
    'Halve the peppers and remove the seeds.',
    'Mix the quinoa, black beans, diced onion, half the tomato sauce, cumin, oil and salt.',
    'Fill the peppers, top with the remaining sauce and bake covered at 200 C for 30 minutes, then uncovered for 10.',
  ]),
  r('baked_tofu_sweet_potato', 'Baked tofu, sweet potato and kale with tahini', D, 'neutral', [['tofu_firm', 200], ['sweet_potato', 200], ['kale', 80], ['olive_oil', 10], ['tahini', 15], ['lemon_juice', 10]], 35, [
    'Cube the tofu and sweet potato, toss with the oil, salt and paprika and roast at 220 C for 25 minutes.',
    'Add the kale to the tray for the last 5 minutes until crisp at the edges.',
    'Whisk the tahini with the lemon juice and water and drizzle over.',
  ]),
  r('ribeye_asparagus', 'Ribeye with garlic butter asparagus and mushrooms', D, 'american', [['beef_ribeye', 200], ['asparagus', 150], ['butter', 15], ['garlic', 3], ['mushrooms', 80]], 25, [
    'Season the steak and sear in a very hot pan 4 minutes per side for medium; rest 5 minutes.',
    'In the same pan, cook the mushrooms and asparagus in the butter with the minced garlic for 5 minutes.',
    'Slice the steak and spoon the garlic butter vegetables alongside.',
  ]),
  r('roast_chicken_thighs_cauliflower', 'Paprika chicken thighs with roasted cauliflower', D, 'neutral', [['chicken_thigh', 200], ['cauliflower', 200], ['olive_oil', 15], ['garlic', 6], ['paprika', 2]], 40, [
    'Toss the chicken and cauliflower florets with the oil, minced garlic, paprika, salt and pepper.',
    'Spread on a tray and roast at 210 C for 30-35 minutes until the chicken is browned and cooked through.',
  ]),
  r('salmon_pesto_zoodles', 'Pesto salmon with zucchini noodles', D, 'italian', [['salmon', 170], ['zucchini', 200], ['pesto', 30], ['cherry_tomatoes', 60], ['olive_oil', 7]], 20, [
    'Spread half the pesto on the salmon and bake at 200 C for 12-14 minutes.',
    'Spiralise or julienne the zucchini; saute in the olive oil with the halved tomatoes for 2-3 minutes.',
    'Toss the zoodles with the remaining pesto and serve with the salmon.',
  ]),
  r('shrimp_cauliflower_fried_rice', 'Shrimp cauliflower fried rice', D, 'asian', [['shrimp', 180], ['cauliflower_rice', 200], ['egg', 50], ['sesame_oil', 10], ['tamari', 15], ['green_onion', 15]], 20, [
    'Cook the shrimp in half the sesame oil over high heat for 2-3 minutes; set aside.',
    'Add the cauliflower rice and cook 4 minutes; push aside, scramble the egg in the gap.',
    'Return the shrimp, add the tamari and sliced green onion and toss.',
  ]),
  r('burger_bowl', 'Bunless burger bowl', D, 'american', [['beef_ground_80', 170], ['lettuce_iceberg', 100], ['cheddar', 40], ['pickles', 30], ['tomato', 60], ['mayonnaise', 20], ['mustard', 5], ['red_onion', 20]], 20, [
    'Shape the beef into two patties, season and fry 3-4 minutes per side; melt the cheddar on top.',
    'Shred the lettuce and slice the tomato, pickles and onion.',
    'Build the bowl and dress with the mayonnaise and mustard.',
  ]),
  r('pork_chops_green_beans', 'Pork chops with garlic butter green beans', D, 'american', [['pork_chop', 200], ['green_beans', 150], ['butter', 15], ['garlic', 3]], 25, [
    'Season the chops and pan-fry 4-5 minutes per side until just cooked; rest.',
    'Blanch the green beans 3 minutes, then toss in the pan with the butter and garlic for 2 minutes.',
  ]),
  r('keto_tofu_coconut_curry', 'Tofu and spinach coconut curry (no rice)', D, 'indian', [['tofu_firm', 200], ['coconut_milk', 100], ['curry_paste', 15], ['spinach', 100], ['coconut_oil', 7]], 20, [
    'Cube the tofu and fry in the coconut oil until golden.',
    'Add the curry paste for 1 minute, then the coconut milk; simmer 5 minutes.',
    'Stir in the spinach until wilted and season with salt and lime.',
  ]),
  r('cheesy_cauliflower_bake', 'Cheesy cauliflower bake', D, 'american', [['cauliflower', 250], ['cheddar', 50], ['heavy_cream', 40], ['egg', 50]], 35, [
    'Steam the cauliflower florets 6 minutes and drain well.',
    'Whisk the egg with the cream, salt, pepper and half the grated cheddar; fold in the cauliflower.',
    'Tip into a small dish, top with the remaining cheese and bake at 200 C for 20 minutes until golden.',
  ]),
  r('chicken_pesto_zoodles', 'Chicken pesto zucchini noodles', D, 'italian', [['chicken_breast', 170], ['zucchini', 200], ['pesto', 35], ['parmesan', 10], ['olive_oil', 7]], 20, [
    'Cube the chicken, season and pan-fry in the olive oil for 7 minutes.',
    'Add the spiralised zucchini and cook 2 minutes more.',
    'Toss with the pesto and finish with parmesan.',
  ]),
  r('halloumi_mushroom_skillet', 'Halloumi, mushroom and spinach skillet', D, 'mediterranean', [['halloumi', 120], ['mushrooms', 150], ['spinach', 80], ['olive_oil', 10], ['garlic', 3]], 15, [
    'Fry the sliced mushrooms in the olive oil until browned; add the garlic for 30 seconds.',
    'Add the spinach and cook until wilted; season.',
    'Grill or pan-fry the sliced halloumi until golden and place on top.',
  ]),
  r('tempeh_bok_choy', 'Sesame tempeh with bok choy', D, 'asian', [['tempeh', 120], ['bok_choy', 150], ['sesame_oil', 12], ['tamari', 10], ['garlic', 3]], 15, [
    'Slice the tempeh and fry in the sesame oil until golden on both sides.',
    'Add the garlic and halved bok choy with a splash of water; cover 3 minutes.',
    'Splash in the tamari and toss.',
  ]),
  r('lamb_couscous', 'Lamb chops with couscous and zucchini', D, 'middle_eastern', [['lamb_chop', 150], ['couscous_cooked', 150], ['zucchini', 100], ['tomato', 80], ['olive_oil', 7], ['mint', 3]], 30, [
    'Season the lamb with cumin, salt and pepper and grill or pan-fry 3-4 minutes per side; rest.',
    'Slice the zucchini and cook in the olive oil for 5 minutes; dice the tomato.',
    'Fluff the couscous, fold in the vegetables and chopped mint and serve with the lamb.',
  ]),
  r('teriyaki_chicken_rice', 'Teriyaki chicken with rice and broccoli', D, 'asian', [['chicken_thigh', 150], ['teriyaki_sauce', 30], ['rice_white_cooked', 180], ['broccoli', 100], ['sesame_seeds', 5]], 25, [
    'Cube the chicken and pan-fry in a little oil for 7-8 minutes until browned.',
    'Add the teriyaki sauce and let it glaze for 2 minutes.',
    'Steam the broccoli 3 minutes; serve everything over rice with sesame seeds.',
  ]),
  r('fish_tacos', 'Fish tacos with cabbage slaw', D, 'mexican', [['tilapia', 150], ['tortilla_corn', 78], ['cabbage', 60], ['salsa', 40], ['avocado', 50], ['lime', 10], ['greek_yogurt_0', 30]], 20, [
    'Season the fish with cumin, paprika and salt and pan-fry 3 minutes per side; flake.',
    'Shred the cabbage and toss with lime juice and salt; mix the yogurt with a little lime.',
    'Warm the tortillas and fill with fish, slaw, salsa, avocado and the lime yogurt.',
  ]),
  r('seitan_stir_fry', 'Hoisin seitan stir-fry with brown rice', D, 'asian', [['seitan', 150], ['stir_fry_vegetables', 200], ['rice_brown_cooked', 150], ['hoisin_sauce', 20], ['sesame_oil', 7]], 20, [
    'Slice the seitan and fry in the sesame oil over high heat until browned.',
    'Add the vegetables and stir-fry 4 minutes.',
    'Stir in the hoisin sauce and serve over the rice.',
  ]),
  r('veggie_fried_rice', 'Vegetable egg fried rice', D, 'asian', [['rice_brown_cooked', 200], ['egg', 100], ['peas', 60], ['carrot', 50], ['green_onion', 15], ['tamari', 15], ['sesame_oil', 10]], 15, [
    'Scramble the eggs in half the sesame oil and set aside.',
    'Stir-fry the diced carrot and peas 3 minutes, add the rice and fry 4 minutes until it starts to crisp.',
    'Return the eggs, add the tamari and green onion and toss.',
  ]),
  r('sea_bass_mediterranean', 'Mediterranean sea bass with potatoes and olives', D, 'mediterranean', [['sea_bass', 180], ['potato', 150], ['cherry_tomatoes', 100], ['olives', 30], ['olive_oil', 10], ['lemon_juice', 10], ['oregano', 1]], 35, [
    'Slice the boiled potatoes, toss with half the oil and roast at 220 C for 15 minutes.',
    'Add the fish, tomatoes and olives, drizzle with the remaining oil, oregano and lemon juice.',
    'Roast 12-15 minutes until the fish is opaque and flakes easily.',
  ]),
  r('gnocchi_tomato_spinach', 'Gnocchi with tomato sauce, spinach and mozzarella', D, 'italian', [['gnocchi', 200], ['tomato_sauce', 150], ['spinach', 60], ['mozzarella', 40], ['olive_oil', 7]], 15, [
    'Boil the gnocchi until they float, about 2-3 minutes; drain.',
    'Warm the tomato sauce with the olive oil and wilt the spinach in it.',
    'Toss in the gnocchi, top with the mozzarella and cover for 1 minute to melt.',
  ]),

  // ================================================================ Snacks
  r('apple_peanut_butter', 'Apple with peanut butter', S, 'neutral', [['apple', 180], ['peanut_butter', 16]], 2, ['Slice the apple.', 'Dip or spread with the peanut butter.']),
  r('greek_yogurt_honey', 'Greek yogurt with honey', S, 'neutral', [['greek_yogurt_0', 170], ['honey', 10]], 2, ['Spoon the yogurt into a bowl.', 'Drizzle the honey over the top.']),
  r('hummus_carrots', 'Hummus with carrot sticks', S, 'middle_eastern', [['hummus', 60], ['carrot', 120]], 3, ['Cut the carrots into sticks.', 'Dip in the hummus.']),
  r('mixed_nuts_snack', 'Handful of mixed nuts', S, 'neutral', [['mixed_nuts', 30]], 1, ['Measure out a small handful of nuts.', 'Eat slowly; they are calorie-dense.']),
  r('whey_shake', 'Whey protein shake', S, 'neutral', [['whey_protein', 30], ['milk_2', 250]], 2, ['Pour the milk into a shaker.', 'Add the whey and shake until smooth.']),
  r('vegan_protein_shake', 'Pea protein banana shake', S, 'neutral', [['pea_protein', 30], ['almond_milk', 250], ['banana', 60]], 3, ['Blend the almond milk, pea protein and banana until smooth.', 'Add ice if you like it cold and thick.']),
  r('cottage_cheese_berries', 'Cottage cheese with blueberries', S, 'neutral', [['cottage_cheese', 150], ['blueberries', 75]], 2, ['Spoon the cottage cheese into a bowl.', 'Top with the blueberries.']),
  r('rice_cakes_almond_butter', 'Rice cakes with almond butter', S, 'neutral', [['rice_cakes', 18], ['almond_butter', 16]], 2, ['Spread the almond butter over the rice cakes.', 'Add a pinch of cinnamon if you like.']),
  r('cheese_olives', 'Cheddar and olives', S, 'mediterranean', [['cheddar', 40], ['olives', 30]], 1, ['Cube the cheddar.', 'Serve with the olives.']),
  r('hard_boiled_eggs', 'Two hard-boiled eggs', S, 'neutral', [['egg', 100], ['salt', 1]], 12, ['Lower the eggs into boiling water and cook 9-10 minutes.', 'Cool in cold water, peel and season with salt.']),
  r('edamame_snack', 'Salted edamame', S, 'asian', [['edamame', 120], ['salt', 1]], 5, ['Boil or steam the edamame 4-5 minutes.', 'Drain and toss with the salt.']),
  r('banana_snack', 'Banana', S, 'neutral', [['banana', 118]], 1, ['Peel the banana.', 'Eat it as is, or slice into yogurt.']),
  r('dark_chocolate_almonds', 'Dark chocolate and almonds', S, 'neutral', [['dark_chocolate', 20], ['almonds', 20]], 1, ['Break the chocolate into squares.', 'Eat with the almonds.']),
  r('veggies_guacamole', 'Veggie sticks with guacamole', S, 'mexican', [['cucumber', 100], ['bell_pepper', 80], ['guacamole', 60]], 5, ['Cut the cucumber and pepper into sticks.', 'Dip in the guacamole.']),
  r('trail_mix_snack', 'Trail mix', S, 'american', [['trail_mix', 40]], 1, ['Measure out the trail mix.', 'Portion it out rather than eating from the bag.']),
  r('protein_bar_snack', 'Protein bar', S, 'neutral', [['protein_bar', 60]], 1, ['Unwrap the bar.', 'Pair with water or a coffee.']),
  r('celery_peanut_butter', 'Celery with peanut butter', S, 'american', [['celery', 80], ['peanut_butter', 24]], 3, ['Cut the celery into sticks.', 'Fill the grooves with the peanut butter.']),
  r('tuna_cucumber_bites', 'Tuna cucumber bites', S, 'neutral', [['tuna_canned', 80], ['cucumber', 100], ['mayonnaise', 10]], 5, ['Mix the drained tuna with the mayonnaise, salt and pepper.', 'Slice the cucumber into thick rounds and top each with tuna.']),
  r('skyr_raspberries', 'Skyr with raspberries', S, 'nordic', [['skyr', 150], ['raspberries', 60]], 2, ['Spoon the skyr into a bowl.', 'Top with the raspberries.']),
  r('pumpkin_seeds_snack', 'Pumpkin seeds', S, 'neutral', [['pumpkin_seeds', 30]], 1, ['Measure out the seeds.', 'Toast in a dry pan for 2 minutes for extra crunch, if you like.']),
  r('fruit_salad', 'Fruit salad', S, 'neutral', [['apple', 100], ['orange', 100], ['grapes', 80]], 5, ['Dice the apple and segment the orange.', 'Toss with the grapes and a squeeze of the orange juice.']),
  r('popcorn_snack', 'Air-popped popcorn', S, 'american', [['popcorn', 24]], 5, ['Pop the kernels in an air popper or a covered pot with no oil.', 'Season lightly with salt.']),
  r('energy_ball_snack', 'Date and nut energy balls', S, 'neutral', [['energy_ball', 60]], 1, ['Take two energy balls from the fridge.', 'Eat with a glass of water.']),
  r('soy_yogurt_berries', 'Soy yogurt with mixed berries', S, 'neutral', [['soy_yogurt', 150], ['mixed_berries_frozen', 75]], 2, ['Let the berries thaw for a few minutes or microwave 30 seconds.', 'Spoon over the soy yogurt.']),
  r('avocado_rice_cakes', 'Rice cakes with avocado', S, 'neutral', [['rice_cakes', 18], ['avocado', 60], ['chili_flakes', 1]], 3, ['Mash the avocado with salt and a squeeze of lemon.', 'Spread on the rice cakes and sprinkle with chili flakes.']),
  r('turkey_cheese_rollups', 'Turkey and cheese roll-ups', S, 'american', [['deli_turkey', 56], ['cheddar', 28]], 2, ['Lay a slice of cheese on each slice of turkey.', 'Roll up tightly.']),
  r('coconut_yogurt_walnuts', 'Coconut yogurt with walnuts', S, 'neutral', [['coconut_yogurt', 150], ['walnuts', 15]], 1, ['Spoon the coconut yogurt into a bowl.', 'Top with the chopped walnuts.']),
];

export const RECIPES_BY_ID: ReadonlyMap<string, Recipe> = new Map(RECIPES.map((x) => [x.id, x]));
