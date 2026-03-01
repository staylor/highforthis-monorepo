import debounce from 'lodash.debounce';
import type { MutableRefObject } from 'react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useFetcher } from 'react-router';

interface RelayPageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface RelayConnection<T> {
  edges?: T[];
  pageInfo?: RelayPageInfo;
}

export default function useInfiniteScroll<T>(ref: MutableRefObject<null>, basePath: string) {
  const fetcher = useFetcher<T>();
  const [connection, setConnection] = useState<RelayConnection<T>>({});
  const connectionRef = useRef(connection);
  connectionRef.current = connection;
  const initialLoaded = useRef(false);

  // Initial fetch
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true;
      fetcher.load(`${basePath}?index`);
    }
  }, [fetcher, basePath]);

  // Merge fetcher data into connection
  useEffect(() => {
    const data = fetcher.data as Record<string, any>;
    if (!data) return;

    const [key] = Object.keys(data);
    const incoming = data[key];

    setConnection((prev) => {
      if (!prev.edges) return incoming;

      const existingIds = new Set(prev.edges.map((e: any) => (e.node ? e.node.id : e.id)));
      const uniqueEdges = incoming.edges.filter((e: any) => {
        const id = e.node ? e.node.id : e.id;
        return !existingIds.has(id);
      });

      return {
        ...incoming,
        edges: [...prev.edges, ...uniqueEdges],
        pageInfo: incoming.pageInfo,
      };
    });
  }, [fetcher.data]);

  // Scroll handler using ref to avoid stale closures
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollListener = useCallback(
    debounce(() => {
      const { pageInfo } = connectionRef.current;
      if (!ref.current || !pageInfo?.hasNextPage) return;

      const elem = ref.current as HTMLElement;
      if (elem.scrollTop + elem.offsetHeight >= elem.scrollHeight) {
        fetcher.load(`${basePath}/${pageInfo.endCursor}`);
      }
    }, 500),
    [ref, basePath, fetcher]
  );

  // Attach/detach scroll listener
  useEffect(() => {
    const elem = ref.current as HTMLElement | null;
    if (!elem || !connection.edges) return;

    elem.addEventListener('scroll', scrollListener);
    return () => {
      elem.removeEventListener('scroll', scrollListener);
      scrollListener.cancel();
    };
  }, [ref, connection.edges, scrollListener]);

  return { fetcher, connection };
}
