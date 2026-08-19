import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routePatterns } from '@/config/routes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoader } from '@/components/common/Feedback';
import { RootLayout } from '@/components/layout/RootLayout';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Routes are code-split so the first paint only downloads the landing page.
 * The examination screen in particular pulls in the navigator, timer and
 * question components that no other page needs.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const MockTestsPage = lazy(() => import('@/pages/MockTestsPage'));
const MockTestDetailPage = lazy(() => import('@/pages/MockTestDetailPage'));
const InstructionsPage = lazy(() => import('@/pages/InstructionsPage'));
const ExamPage = lazy(() => import('@/pages/ExamPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const PracticePage = lazy(() => import('@/pages/PracticePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

/**
 * Router basename.
 *
 * Vite injects the configured `base` here, so a GitHub Pages project site
 * served from `/<repo>/` routes correctly without any hard-coded name.
 */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { path: routePatterns.home, element: <HomePage /> },
        { path: routePatterns.mockTests, element: <MockTestsPage /> },
        { path: routePatterns.mockTest, element: <MockTestDetailPage /> },
        { path: routePatterns.instructions, element: <InstructionsPage /> },
        { path: routePatterns.result, element: <ResultPage /> },
        { path: routePatterns.review, element: <ReviewPage /> },
        { path: routePatterns.results, element: <ResultsPage /> },
        { path: routePatterns.practice, element: <PracticePage /> },
        { path: routePatterns.about, element: <AboutPage /> },
        { path: routePatterns.notFound, element: <NotFoundPage /> },
      ],
    },
    {
      // The exam runs in its own distraction-free shell, without the site
      // header and footer.
      path: routePatterns.exam,
      element: (
        <ErrorBoundary area="examination">
          <Suspense fallback={<PageLoader />}>
            <ExamPage />
          </Suspense>
        </ErrorBoundary>
      ),
    },
  ],
  { basename: basename || '/' },
);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
