import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { routes } from '@/config/routes';
import { useSetUiLanguage, useUiLanguage } from '@/store/uiLanguageStore';
import type { Language } from '@/types/exam';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/utils/cn';

const navItems: { to: string; label: Record<Language, string>; end: boolean }[] = [
  { to: routes.home, label: { hindi: 'होम', english: 'Home' }, end: true },
  { to: routes.mockTests, label: { hindi: 'प्रैक्टिस सेट', english: 'Practice Sets' }, end: false },
  { to: routes.practice, label: { hindi: 'पाठ्यक्रम', english: 'Syllabus' }, end: false },
  { to: routes.results, label: { hindi: 'परिणाम', english: 'Results' }, end: false },
  { to: routes.about, label: { hindi: 'परिचय', english: 'About' }, end: false },
];

const linkStyles = (isActive: boolean): string =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-soft text-brand dark:text-brand-strong' : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  );

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Website language only. The question paper has its own, independent switch.
  const uiLanguage = useUiLanguage();
  const setUiLanguage = useSetUiLanguage();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={routes.home} className="flex items-center gap-2.5 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white dark:text-ink-inverse">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-ink sm:text-base">BPSC TRE Mock Test</span>
            <span className="hidden text-xs text-ink-subtle sm:block">
              {uiLanguage === 'hindi' ? 'प्रारंभिक परीक्षा अभ्यास' : 'Preliminary Examination Practice'}
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => linkStyles(isActive)}>
              {item.label[uiLanguage]}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageToggle
              value={uiLanguage}
              onChange={setUiLanguage}
              size="sm"
              label={uiLanguage === 'hindi' ? 'साइट' : 'Site'}
              ariaLabel="Website language"
            />
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:text-ink lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          className="border-t border-line bg-surface px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn(linkStyles(isActive), 'block w-full')}
                >
                  {item.label[uiLanguage]}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-line pt-3 sm:hidden">
            <LanguageToggle
              value={uiLanguage}
              onChange={setUiLanguage}
              size="sm"
              className="w-full justify-center"
              label={uiLanguage === 'hindi' ? 'साइट' : 'Site'}
              ariaLabel="Website language"
            />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
