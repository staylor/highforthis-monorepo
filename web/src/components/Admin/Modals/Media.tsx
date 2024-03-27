import type { SyntheticEvent } from 'react';
import { useRef } from 'react';
import ReactDOM from 'react-dom';

import Loading from '@/components/Loading';
import { uploadUrl } from '@/utils/media';
import type { AudioUpload, ImageUpload, MediaUpload, MediaUploadConnection } from '@/types/graphql';
import type { SelectedImage, SelectedImageData } from '@/types/admin';

import CloseButton from './CloseButton';
import useInfiniteScroll from './useInfiniteScroll';
import { modalClass, frameClass, itemTitleClass } from './styles';

interface MediaModalProps {
  type?: string;
  onClose: (e: SyntheticEvent) => void;
  selectAudio: (data: AudioUpload) => void;
  selectImage: (data: SelectedImage) => void;
}

function MediaModal({ type = 'image', onClose, selectAudio, selectImage }: MediaModalProps) {
  const basePath = `/modals/media/${type}`;
  const frameRef = useRef(null);
  const { fetcher, connection } = useInfiniteScroll<MediaUpload>(frameRef, basePath);
  const uploads = connection as MediaUploadConnection;

  const portal = document.getElementById('portal');
  if (!portal) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={modalClass} id="media-modal">
      <CloseButton className="dashicons dashicons-no" onClick={onClose} />
      <div className={frameClass} ref={frameRef}>
        {uploads.edges?.map(({ node }) => {
          const crops =
            type === 'audio' ? (node as AudioUpload).images : (node as ImageUpload).crops;
          const crop = crops?.find((c) => c?.width === 150);
          return (
            <div
              className="float-left m-1.5 h-28 w-30 cursor-pointer overflow-hidden bg-zinc-50"
              key={node.id}
              onClick={(e: SyntheticEvent) => {
                e.preventDefault();

                if (node.type === 'audio') {
                  selectAudio(node as AudioUpload);
                } else {
                  const normalized = {
                    id: node.id,
                    destination: node.destination,
                    crops: [],
                  } as SelectedImageData;

                  (node as ImageUpload).crops.forEach(({ width, fileName }) => {
                    normalized.crops.push({ width, fileName });
                  });

                  selectImage({
                    imageId: node.id,
                    image: normalized,
                    size: 'FEATURE',
                  });
                }

                onClose(e);
              }}
            >
              {crop ? <img alt="" src={uploadUrl(node.destination, crop.fileName)} /> : null}
              <span className={itemTitleClass}>{node.title}</span>
            </div>
          );
        })}
        {fetcher.state === 'loading' && <Loading />}
      </div>
    </div>,
    portal
  );
}

export default MediaModal;
