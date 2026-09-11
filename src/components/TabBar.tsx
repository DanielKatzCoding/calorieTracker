import { NavLink } from 'react-router';

const tabs = [
  { to: '/today', label: 'Today', icon: '◎' },
  { to: '/diary', label: 'Diary', icon: '☰' },
  { to: '/menu', label: 'Menu', icon: '🍽' },
  { to: '/train', label: 'Train', icon: '⚡' },
  { to: '/more', label: 'More', icon: '⋯' },
] as const;

export function TabBar() {
  return (
    <nav
      className="grid grid-cols-5 border-t border-border bg-surface pb-[var(--safe-bottom)]"
      aria-label="Main"
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex h-16 flex-col items-center justify-center gap-0.5 text-xs ${
              isActive ? 'text-accent' : 'text-muted'
            }`
          }
        >
          <span className="text-xl leading-none" aria-hidden>
            {t.icon}
          </span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
