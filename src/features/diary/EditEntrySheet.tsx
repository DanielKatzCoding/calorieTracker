import { useState } from 'react';
import type { DiaryEntry, MealSlot } from '@/domain/types';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/Button';
import { NumberField } from '@/components/NumberField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SLOT_LABEL } from '@/domain/menu/slots';
import { updateEntryGrams } from '@/services/logging';
import { diaryRepo } from '@/storage/repos/diaryRepo';
import { scaleMacros, roundMacros } from '@/domain/menu/nutrition';

export function EditEntrySheet({ entry, onClose }: { entry: DiaryEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return <Inner key={entry.id} entry={entry} onClose={onClose} />;
}

function Inner({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const [grams, setGrams] = useState<number | null>(entry.grams);
  const [slot, setSlot] = useState<MealSlot>(entry.slot);
  const preview = grams && entry.grams > 0 ? roundMacros(scaleMacros(entry.macros, grams / entry.grams)) : entry.macros;

  const save = async () => {
    if (grams && grams > 0 && grams !== entry.grams) await updateEntryGrams(entry, grams);
    if (slot !== entry.slot) await diaryRepo().update(entry.id, { slot });
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={entry.name}
      footer={
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="w-28"
            onClick={async () => {
              await diaryRepo().remove(entry.id);
              onClose();
            }}
          >
            Delete
          </Button>
          <Button block onClick={save} disabled={!grams || grams <= 0}>
            Save · {Math.round(preview.kcal)} kcal
          </Button>
        </div>
      }
    >
      <NumberField label="Amount" value={grams} onChange={setGrams} unit="g" min={1} max={5000} step={5} stepper />
      <div className="mt-4">
        <div className="mb-2 text-sm text-muted">Meal</div>
        <SegmentedControl options={(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((s) => ({ value: s, label: SLOT_LABEL[s] }))} value={slot} onChange={setSlot} columns={4} />
      </div>
      <p className="mt-4 text-sm text-muted">
        P {Math.round(preview.proteinG)} g · C {Math.round(preview.carbsG)} g · F {Math.round(preview.fatG)} g
      </p>
    </Sheet>
  );
}
