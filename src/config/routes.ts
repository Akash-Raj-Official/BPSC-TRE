/**
 * Single place where every URL in the application is defined.
 * Components build links through these helpers so a route rename is a one-line
 * change and there are no hard-coded (or broken) paths in the JSX.
 */
export const routes = {
  home: '/',
  mockTests: '/mock-tests',
  mockTest: (testId: string) => `/mock-tests/${testId}`,
  instructions: (testId: string) => `/mock-tests/${testId}/instructions`,
  exam: (testId: string) => `/mock-tests/${testId}/exam`,
  result: (testId: string) => `/mock-tests/${testId}/result`,
  review: (testId: string) => `/mock-tests/${testId}/review`,
  results: '/results',
  practice: '/practice',
  about: '/about',
} as const;

export const routePatterns = {
  home: '/',
  mockTests: '/mock-tests',
  mockTest: '/mock-tests/:testId',
  instructions: '/mock-tests/:testId/instructions',
  exam: '/mock-tests/:testId/exam',
  result: '/mock-tests/:testId/result',
  review: '/mock-tests/:testId/review',
  results: '/results',
  practice: '/practice',
  about: '/about',
  notFound: '*',
} as const;
