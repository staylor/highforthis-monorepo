import type { SerializedEditorState } from 'lexical';
import { clientEntry, on, ref, type Handle, type RemixNode } from 'remix/component';

import type { ImageUpload, Video } from '../../../../types/graphql.ts';
import { cn } from '../../../public/cn.ts';
import { Icon, type IconName } from '../icon.tsx';
import { PickerDialog } from '../picker-dialog.tsx';

import { BLOCK_TYPES, createBlockToolbar, type BlockStyle } from './block-toolbar.ts';
import { createPostEditor } from './editor.ts';
import { createInlineToolbar, INLINE_FORMATS, type InlineFormat } from './inline-toolbar.ts';
import type { Store } from './store.ts';
import { theme } from './theme.ts';

// The post editor, from the admin app's components/Editor: the framework-free core (editor.ts and
// the toolbars) hosted in a client entry. It renders the contenteditable element, the form field
// the post save reads, the placeholder, and the toolbars, and redraws when the core's stores
// change. The block toolbar's image and video buttons open the picker.

interface PostEditorProps {
  /** The post's saved body as JSON, as GraphQL sends it, or empty for a new post. */
  editorState: string;
  /** Translated text: the placeholder, the block button and the pickers. */
  labels: {
    placeholder: string;
    blockTypes: string;
    media: string;
    videos: string;
    close: string;
    loading: string;
  };
}

const iconClass = 'size-4';

const blockLabels: Record<BlockStyle, RemixNode> = {
  h2: 'H2',
  h3: 'H3',
  'atomic-image': <Icon name="media" class={iconClass} />,
  video: <Icon name="video" class={iconClass} />,
  blockquote: <Icon name="quote" class={iconClass} />,
  bullet: <Icon name="listBullet" class={iconClass} />,
  number: <Icon name="listOrdered" class={iconClass} />,
  code: <Icon name="code" class={iconClass} />,
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
    return <Icon name={icon} class={iconClass} />;
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

const toolbarClass = cn(
  'toolbar-hidden absolute z-50 rounded border border-gray-200 bg-white p-1 shadow-lg transition-[scale]',
  'after:border-transparent after:border-t-white',
  'after:pointer-events-none after:absolute after:right-1/2 after:-bottom-3 after:size-0'
);

/** A toolbar button. It acts on mousedown and keeps the focus in the editor. */
function StyleButton(handle: Handle<{ active: boolean; label: RemixNode; onToggle: () => void }>) {
  return () => (
    <span
      role="button"
      tabIndex={-1}
      class={cn(
        'flex size-7 cursor-pointer items-center justify-center first:rounded-l last:rounded-r',
        handle.props.active ? 'text-dark hover:text-pink' : 'text-detail hover:text-dark'
      )}
      mix={on('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handle.props.onToggle();
      })}
    >
      {handle.props.label}
    </span>
  );
}

const controlsClass = 'relative inline-flex items-center gap-1 text-sm select-none';

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
          <div class="editor-container relative left-0 lg:-left-6">
            <div class="editor-inner">
              {/* Lexical renders the post into this element */}
              <div
                class="editor-input"
                contentEditable
                role="textbox"
                spellcheck
                aria-label={labels.placeholder}
                mix={ref(mount)}
              />
              {postEditor.placeholder.get() && (
                <div class="editor-placeholder">{labels.placeholder}</div>
              )}
            </div>
            {/* The inline toolbar, over selected text */}
            <div
              class={cn(toolbarClass, inlineState.flush && 'after:border-t-transparent')}
              style={{
                left: `${inlineState.left}px`,
                top: `${inlineState.top}px`,
                scale: inlineState.visible ? '1' : undefined,
              }}
              mix={ref((node, signal) => {
                const unregister = inline.register(node as HTMLElement);
                signal.addEventListener('abort', unregister);
              })}
            >
              <div class={controlsClass}>
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
              class="toolbar-hidden absolute -left-7.5 block cursor-pointer text-detail transition-[scale] hover:text-detail-dark"
              style={{ top: `${blockState.top}px`, scale: blockState.visible ? '1' : undefined }}
              mix={on('mousedown', (event) => {
                event.preventDefault();
                event.stopPropagation();
                block.toggleOpen();
              })}
            >
              <Icon name={blockState.open ? 'closeCircle' : 'plusCircle'} class="size-6" />
            </div>
            <div
              class={cn(toolbarClass, '-left-7 after:right-auto after:left-1')}
              style={{
                top: `${blockState.toolbarTop}px`,
                scale: blockState.visible && blockState.open ? '1' : undefined,
              }}
            >
              <div class={controlsClass}>
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
