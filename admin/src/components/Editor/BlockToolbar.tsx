import type { LexicalEditor } from 'lexical';
import { useEffect, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';

import MediaModal from '#/components/Admin/Modals/Media';
import VideoModal from '#/components/Admin/Modals/Video';
import Controls from '#/components/Editor/Controls';
import BlockButton from '#/components/Editor/Controls/BlockButton';
import StyleButton from '#/components/Editor/Controls/StyleButton';
import Toolbar from '#/components/Editor/Toolbar';
import Icon from '#/components/Icon';
import type { ImageUpload, Video } from '#/types/graphql';

import { BLOCK_TYPES, createBlockToolbar } from './core/blockToolbar';
import type { BlockStyle } from './core/blockToolbar';
import useStore from './useStore';

const iconClass = 'h-4 w-4';

const labels: Record<BlockStyle, ReactNode> = {
  h2: 'H2',
  h3: 'H3',
  'atomic-image': <Icon name="media" className={iconClass} />,
  video: <Icon name="video" className={iconClass} />,
  blockquote: <Icon name="quote" className={iconClass} />,
  bullet: <Icon name="listBullet" className={iconClass} />,
  number: <Icon name="listOrdered" className={iconClass} />,
  code: <Icon name="code" className={iconClass} />,
};

export default function BlockToolbar({ editor }: { editor: LexicalEditor }) {
  const [toolbar] = useState(() => createBlockToolbar(editor));
  const { visible, open, top, toolbarTop, style, picker } = useStore(toolbar);

  useEffect(() => toolbar.register(), [toolbar]);

  const closePicker = (e: SyntheticEvent) => {
    e.preventDefault();
    toolbar.closePicker();
  };

  return (
    <>
      <BlockButton
        active={open}
        style={{ top, scale: visible ? '1' : undefined }}
        onMouseDown={toolbar.toggleOpen}
      />
      <Toolbar
        className="-left-7 after:right-auto after:left-1"
        style={{ top: toolbarTop, scale: visible && open ? '1' : undefined }}
      >
        <Controls>
          {BLOCK_TYPES.map((type) => (
            <StyleButton
              key={type.style}
              active={style === type.style}
              label={labels[type.style]}
              onToggle={() => toolbar.choose(type.style)}
              style={type.style}
            />
          ))}
        </Controls>
      </Toolbar>
      {picker === 'media' && (
        <MediaModal
          selectImage={({ image, size }) => toolbar.insertImage(image as ImageUpload, size)}
          selectAudio={() => {}}
          onClose={closePicker}
        />
      )}
      {picker === 'video' && (
        <VideoModal
          selectVideo={({ video }) => toolbar.insertVideo(video as Video)}
          onClose={closePicker}
        />
      )}
    </>
  );
}
