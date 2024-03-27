import type { VideoUpload } from '@/types/graphql';

export default function VideoInfo({ media }: { media: VideoUpload }) {
  return (
    <>
      {media.duration && (
        <>
          <strong>Duration:</strong> {~~(media.duration / 60)} mins,{' '}
          {Math.floor(media.duration % 60)} seconds
          <br />
        </>
      )}
      <strong>Dimensions:</strong> {media.width} x {media.height}
    </>
  );
}
