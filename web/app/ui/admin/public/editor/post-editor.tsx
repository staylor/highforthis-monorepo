import type { SerializedEditorState } from 'lexical';
import { clientEntry, css, on, ref, type Handle, type RemixNode } from 'remix/component';

import type { ImageUpload, Video } from '#/types/graphql.ts';
import { Icon, type IconName } from '#/ui/admin/public/icon.tsx';
import { PickerDialog } from '#/ui/admin/public/picker-dialog.tsx';
import { lg, text } from '#/ui/public/styles.ts';

import { BLOCK_TYPES, createBlockToolbar, type BlockStyle } from './block-toolbar.ts';
import { createPostEditor } from './editor.ts';
import { createInlineToolbar, INLINE_FORMATS, type InlineFormat } from './inline-toolbar.ts';
import type { Store } from './store.ts';
import { theme } from './theme.ts';

// The framework-free core (editor.ts and the toolbars) hosted in a client entry. It renders the
// contenteditable element, the form field the post save reads, the placeholder, and the
// toolbars, and redraws when the core's stores change. The block toolbar's image and video
// buttons open the picker.

interface PostEditorProps {
  /** The post's saved body as JSON, as GraphQL sends it, or empty for a new post. */
  editorState: string;
  labels: {
    placeholder: string;
    blockTypes: string;
    media: string;
    videos: string;
    close: string;
    loading: string;
  };
}

const iconSize = '1rem';

const blockLabels: Record<BlockStyle, RemixNode> = {
  h2: 'H2',
  h3: 'H3',
  'atomic-image': <Icon name="media" size={iconSize} />,
  video: <Icon name="video" size={iconSize} />,
  blockquote: <Icon name="quote" size={iconSize} />,
  bullet: <Icon name="listBullet" size={iconSize} />,
  number: <Icon name="listOrdered" size={iconSize} />,
  code: <Icon name="code" size={iconSize} />,
};

const inlineIcons: Partial<Record<InlineFormat, IconName>> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikethrough',
  code: 'code',
};

function inlineLabel(format: InlineFormat): RemixNode {
  const icon = inlineIcons[format];
  if (icon) {
    return <Icon name={icon} size={iconSize} />;
  }
  return format === 'superscript' ? (
    <>
      X<sup>2</sup>
    </>
  ) : (
    <>
      X<sub>2</sub>
    </>
  );
}

// Toolbars grow from nothing when they show: their style attribute sets the scale
const toolbar = {
  position: 'absolute',
  zIndex: 50,
  borderRadius: '0.25rem',
  border: '1px solid var(--gray-200)',
  backgroundColor: '#fff',
  padding: '0.25rem',
  boxShadow: 'var(--shadow-lg)',
  scale: 0,
  transition: 'scale 150ms var(--ease)',
} as const;

// Dark while its style is on
const styleButton = css({
  display: 'flex',
  width: '1.75rem',
  height: '1.75rem',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--detail)',
  '&:first-child': { borderStartStartRadius: '0.25rem', borderEndStartRadius: '0.25rem' },
  '&:last-child': { borderStartEndRadius: '0.25rem', borderEndEndRadius: '0.25rem' },
  '&:hover': { color: 'var(--dark)' },
  '&[data-active]': { color: 'var(--dark)', '&:hover': { color: 'var(--pink)' } },
});

/** A toolbar button. It acts on mousedown and keeps the focus in the editor. */
function StyleButton(handle: Handle<{ active: boolean; label: RemixNode; onToggle: () => void }>) {
  return () => (
    <span
      role="button"
      tabIndex={-1}
      data-active={handle.props.active || undefined}
      mix={[
        styleButton,
        on('mousedown', (event) => {
          event.preventDefault();
          event.stopPropagation();
          handle.props.onToggle();
        }),
      ]}
    >
      {handle.props.label}
    </span>
  );
}

const controls = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  ...text.sm,
  userSelect: 'none',
});

export const PostEditor = clientEntry(
  import.meta.url,
  function PostEditor(handle: Handle<PostEditorProps>) {
    const saved = handle.props.editorState;
    const postEditor = createPostEditor({
      theme,
      editorState: saved ? (JSON.parse(saved) as SerializedEditorState) : null,
    });
    const inline = createInlineToolbar(postEditor.editor);
    const block = createBlockToolbar(postEditor.editor);
    let field: HTMLInputElement | null = null;

    // Redraws whenever the placeholder or a toolbar changes, until the editor goes away
    const watch = (store: Store<unknown>) => {
      const unsubscribe = store.subscribe(() => handle.update());
      handle.signal.addEventListener('abort', unsubscribe);
    };
    watch(postEditor.placeholder);
    watch(inline);
    watch(block);

    const mount = (root: Element, signal: AbortSignal) => {
      if (!field) {
        return;
      }
      const unmount = postEditor.mount(root as HTMLElement, field);
      const unregister = block.register();
      signal.addEventListener('abort', () => {
        unregister();
        unmount();
      });
    };

    return () => {
      const { labels } = handle.props;
      const inlineState = inline.get();
      const blockState = block.get();
      const pick = (style: BlockStyle) => () => block.choose(style);
      return (
        <>
          <input
            type="hidden"
            name="editorState"
            mix={ref((node) => {
              field = node as HTMLInputElement;
            })}
          />
          {/* The negative offset makes room for the block button, which only fits on wide screens */}
          <div
            mix={css({
              position: 'relative',
              left: 0,
              margin: '20px auto',
              maxWidth: '600px',
              color: '#000',
              lineHeight: '20px',
              fontWeight: 400,
              textAlign: 'left',
              borderRadius: '10px 10px 2px 2px',
              [lg]: { left: '-1.5rem' },
            })}
          >
            <div mix={css({ position: 'relative', backgroundColor: '#fff' })}>
              {/* Lexical renders the post into this element, with admin.css's editor- classes */}
              <div
                mix={[
                  css({
                    position: 'relative',
                    minHeight: '150px',
                    resize: 'none',
                    fontSize: '15px',
                    tabSize: 1,
                    outline: 0,
                    padding: '15px 10px',
                    caretColor: '#444',
                  }),
                  ref(mount),
                ]}
                contentEditable
                role="textbox"
                spellcheck
                aria-label={labels.placeholder}
              />
              {postEditor.placeholder.get() && (
                <div
                  mix={css({
                    position: 'absolute',
                    top: '15px',
                    left: '10px',
                    display: 'inline-block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '15px',
                    color: '#999',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  })}
                >
                  {labels.placeholder}
                </div>
              )}
            </div>
            {/* The inline toolbar, over selected text */}
            <div
              mix={[
                css(toolbar),
                ref((node, signal) => {
                  const unregister = inline.register(node as HTMLElement);
                  signal.addEventListener('abort', unregister);
                }),
              ]}
              style={{
                left: `${inlineState.left}px`,
                top: `${inlineState.top}px`,
                scale: inlineState.visible ? '1' : undefined,
              }}
            >
              <div mix={controls}>
                {INLINE_FORMATS.map((format) => (
                  <StyleButton
                    active={inlineState.formats[format]}
                    label={inlineLabel(format)}
                    onToggle={() => inline.toggleFormat(format)}
                  />
                ))}
              </div>
            </div>
            {/* The block button at the start of a line, and the block types it opens */}
            <div
              role="button"
              tabIndex={0}
              aria-label={labels.blockTypes}
              aria-expanded={blockState.open ? 'true' : 'false'}
              style={{ top: `${blockState.top}px`, scale: blockState.visible ? '1' : undefined }}
              mix={[
                css({
                  position: 'absolute',
                  left: '-1.875rem',
                  display: 'block',
                  cursor: 'pointer',
                  color: 'var(--detail)',
                  scale: 0,
                  transition: 'scale 150ms var(--ease)',
                  '&:hover': { color: 'var(--detail-dark)' },
                }),
                on('mousedown', (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  block.toggleOpen();
                }),
              ]}
            >
              <Icon name={blockState.open ? 'closeCircle' : 'plusCircle'} size="1.5rem" />
            </div>
            <div
              mix={css({ ...toolbar, left: '-1.75rem' })}
              style={{
                top: `${blockState.toolbarTop}px`,
                scale: blockState.visible && blockState.open ? '1' : undefined,
              }}
            >
              <div mix={controls}>
                {BLOCK_TYPES.map((type) => (
                  <StyleButton
                    active={blockState.style === type.style}
                    label={blockLabels[type.style]}
                    onToggle={pick(type.style)}
                  />
                ))}
              </div>
            </div>
          </div>
          <PickerDialog
            type="image"
            open={blockState.picker === 'media'}
            onPick={(item) => {
              if (item.image) {
                block.insertImage(item.image as ImageUpload, 'FEATURE');
              }
              block.closePicker();
            }}
            onClose={() => block.closePicker()}
            heading={labels.media}
            closeLabel={labels.close}
            loadingText={labels.loading}
          />
          <PickerDialog
            type="video"
            open={blockState.picker === 'video'}
            onPick={(item) => {
              if (item.video) {
                block.insertVideo(item.video as Video);
              }
              block.closePicker();
            }}
            onClose={() => block.closePicker()}
            heading={labels.videos}
            closeLabel={labels.close}
            loadingText={labels.loading}
          />
        </>
      );
    };
  }
);
