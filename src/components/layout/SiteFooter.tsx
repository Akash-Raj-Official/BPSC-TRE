import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-ink">BPSC TRE Mock Test Platform</p>
            <p className="mt-2 text-sm text-ink-muted">
              A free, offline-friendly practice platform for the BPSC TRE Preliminary examination. All questions are
              practice material written for this platform — they are not official BPSC question papers.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to={routes.mockTests} className="text-ink-muted hover:text-ink">
              Practice Sets
            </Link>
            <Link to={routes.results} className="text-ink-muted hover:text-ink">
              My Results
            </Link>
            <Link to={routes.about} className="text-ink-muted hover:text-ink">
              About
            </Link>
          </nav>
        </div>

        <p className="mt-6 border-t border-line pt-6 text-xs text-ink-subtle">
          Not affiliated with, endorsed by or connected to the Bihar Public Service Commission. Your attempts and
          results are stored only in this browser.
        </p>
      </div>
    </footer>
  );
}
