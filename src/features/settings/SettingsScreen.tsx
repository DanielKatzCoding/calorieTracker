import { Link } from 'react-router';
import { useReadyProfile } from '@/hooks/useReadyProfile';
import { Card, SectionTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { ACTIVITY_OPTIONS, DIET_OPTIONS, GOAL_OPTIONS, EQUIPMENT_OPTIONS, LEVEL_OPTIONS, ALLERGEN_OPTIONS, label } from '@/lib/labels';
import { BackupPanel } from './BackupPanel';
import { InstallHelp } from './InstallHelp';

export function SettingsScreen() {
  const { profile, targets } = useReadyProfile();
  return (
    <div className="px-4 pb-8 pt-3">
      <h1 className="mb-3 px-1 text-2xl font-semibold">More</h1>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted">Daily target</div>
            <div className="text-3xl font-bold text-accent">{targets.kcal} kcal</div>
            <div className="mt-1 text-xs text-muted">
              P {targets.proteinG} · C {targets.carbsG} · F {targets.fatG} g
            </div>
          </div>
          <Link to="/onboarding?edit=1">
            <Button variant="secondary" size="sm">
              Edit profile
            </Button>
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Row k="Goal" v={`${label(GOAL_OPTIONS, profile.goal)}${profile.goal !== 'maintain' ? ` · ${profile.pace} kg/wk` : ''}`} />
          <Row k="Weight → goal" v={`${profile.weightKg} → ${profile.goalWeightKg} kg`} />
          <Row k="Activity" v={label(ACTIVITY_OPTIONS, profile.activity)} />
          <Row k="Diet" v={label(DIET_OPTIONS, profile.diet)} />
          <Row k="Avoids" v={profile.allergens.length ? profile.allergens.map((a) => label(ALLERGEN_OPTIONS, a)).join(', ') : 'nothing'} />
          <Row k="Dislikes" v={profile.dislikedFoodIds.length ? `${profile.dislikedFoodIds.length} foods` : 'none'} />
          <Row k="Meals / day" v={String(profile.mealsPerDay)} />
          <Row k="Training" v={`${profile.training.daysPerWeek}×/wk · ${label(EQUIPMENT_OPTIONS, profile.training.equipment)} · ${label(LEVEL_OPTIONS, profile.training.level)}`} />
        </dl>
      </Card>

      <SectionTitle>Tracking</SectionTitle>
      <Card padded={false}>
        <Link to="/more/weight" className="flex h-12 items-center justify-between px-4 text-sm">
          <span>Weight history</span>
          <span className="text-muted">›</span>
        </Link>
      </Card>

      <SectionTitle>Backup</SectionTitle>
      <BackupPanel />

      <SectionTitle>Install</SectionTitle>
      <InstallHelp />

      <SectionTitle>About</SectionTitle>
      <Card className="text-xs text-muted">
        <p>
          Calorie targets use the Mifflin-St Jeor equation; workout calories use MET values. Nutrition data is transcribed from public sources and
          typical labels and may differ from what you actually eat.
        </p>
        <p className="mt-2">This app is not medical advice. Everything stays on this device; nothing is uploaded anywhere.</p>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted">{k}</dt>
      <dd className="text-right">{v}</dd>
    </>
  );
}
