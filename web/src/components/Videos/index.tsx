import type { SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';

import type { VideoConnection } from '@/types/graphql';

import Video from './Video';
import Button from './Button';

function Videos({ videos }: { videos: VideoConnection }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loadNext = (e: SyntheticEvent) => {
    e.preventDefault();

    navigate('?after=' + videos.edges[videos.edges.length - 1].cursor);
  };

  const loadPrevious = (e: SyntheticEvent) => {
    e.preventDefault();

    navigate('?before=' + videos.edges[0].cursor);
  };

  const hasPrevious = videos.pageInfo.hasPreviousPage || searchParams.get('after');
  const hasNext = videos.pageInfo.hasNextPage || searchParams.get('before');

  return (
    <>
      {videos.edges.length === 0 && <p>No videos found.</p>}
      {videos.edges.map((edge) => (
        <Video key={edge.node.id} video={edge.node} />
      ))}
      {hasPrevious && <Button onClick={loadPrevious}>PREVIOUS</Button>}
      {hasNext && <Button onClick={loadNext}>NEXT</Button>}
    </>
  );
}

export default Videos;
