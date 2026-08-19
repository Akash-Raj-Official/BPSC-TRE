import { Compass } from 'lucide-react';
import { routes } from '@/config/routes';
import { ButtonLink } from '@/components/common/Button';
import { EmptyState } from '@/components/common/Feedback';
import { Container, PageSection } from '@/components/layout/Page';

export function NotFoundPage() {
  return (
    <PageSection>
      <Container className="max-w-2xl">
        <EmptyState
          icon={<Compass className="h-10 w-10" aria-hidden="true" />}
          title="Page not found"
          description="The page you were looking for does not exist or has moved."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink to={routes.home}>Go to home</ButtonLink>
              <ButtonLink to={routes.mockTests} variant="outline">
                Browse practice sets
              </ButtonLink>
            </div>
          }
        />
      </Container>
    </PageSection>
  );
}

export default NotFoundPage;
