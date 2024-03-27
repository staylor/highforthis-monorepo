import type { SyntheticEvent } from 'react';
import { useRef } from 'react';
import ReactDOM from 'react-dom';

import Loading from '@/components/Loading';
import type { Video, VideoConnection, VideoThumbnail } from '@/types/graphql';

import CloseButton from './CloseButton';
import useInfiniteScroll from './useInfiniteScroll';
import { modalClass, frameClass, itemTitleClass } from './styles';

interface SelectedVideoData {
  dataId: string;
  title: string;
  slug: string;
  thumbnails: VideoThumbnail[];
}

interface SelectedVideo {
  videoId: string;
  video: SelectedVideoData;
}

interface VideoModalProps {
  selectVideo: (data: SelectedVideo) => void;
  onClose: (event: SyntheticEvent) => void;
}

function VideoModal({ selectVideo, onClose }: VideoModalProps) {
  const basePath = `/modals/video`;
  const frameRef = useRef(null);
  const { fetcher, connection } = useInfiniteScroll<Video>(frameRef, basePath);
  const videos = connection as VideoConnection;

  const portal = document.getElementById('portal');
  if (!portal) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={modalClass}>
      <CloseButton className="dashicons dashicons-no" onClick={onClose} />
      <div className={frameClass} ref={frameRef}>
        {videos.edges?.map(({ node }) => {
          const crop = node.thumbnails.find((c) => c.width === 120) as VideoThumbnail;
          return (
            <div
              className="float-left m-1.5 h-28 w-30 cursor-pointer overflow-hidden"
              key={node.id}
              onClick={(e) => {
                e.preventDefault();

                const normalized: SelectedVideoData = {
                  dataId: node.dataId,
                  title: node.title,
                  slug: node.slug,
                  thumbnails: [],
                };
                node.thumbnails.forEach(({ width, height, url }) => {
                  normalized.thumbnails.push({ width, height, url });
                });

                selectVideo({
                  videoId: node.id,
                  video: normalized,
                });
                onClose(e);
              }}
            >
              <img alt="" src={crop.url} />
              <span className={itemTitleClass}>{node.title}</span>
            </div>
          );
        })}
        {fetcher.state === 'loading' && <Loading />}
      </div>
    </div>,
    document.getElementById('portal') as HTMLElement
  );
}

export default VideoModal;
