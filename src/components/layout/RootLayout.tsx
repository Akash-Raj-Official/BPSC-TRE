import { Suspense, useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoader } from '@/components/common/Feedback';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Shell for every page except the examination screen, which uses its own
 * distraction-free layout.
 */
export function RootLayout() {
  const location = useLocation();

  // Move focus to the main region on navigation so keyboard and screen-reader
  // users do not have to tab through the header again on every page.
  useEffect(() => {
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <ErrorBoundary area="page">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}
