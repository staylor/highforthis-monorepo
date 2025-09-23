import { useEffect } from 'react';
import { useRevalidator, useRouteLoaderData } from 'react-router';

export default function useSSE() {
  const revalidator = useRevalidator();
  const { isAuthenticated, graphqlHost } = useRouteLoaderData('root');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const es = new EventSource(`${graphqlHost}/sse`);
    es.addEventListener('revalidate', () => {
      revalidator.revalidate();
    });
  }, [graphqlHost, isAuthenticated, revalidator]);
}
