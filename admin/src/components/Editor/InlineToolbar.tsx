import type { LexicalEditor } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import Controls from '#/components/Editor/Controls';
import StyleButton from '#/components/Editor/Controls/StyleButton';
import Toolbar from '#/components/Editor/Toolbar';
import Icon from '#/components/Icon';

import { createInlineToolbar, INLINE_FORMATS } from './core/inlineToolbar';
import type { InlineFormat } from './core/inlineToolbar';
import useStore from './useStore';

const iconClass = 'h-4 w-4';
// Toolbar styles its arrow with this class, for a toolbar against the editor's left edge
const flushClass = 'Toolbar-flush';

const labels: Record<InlineFormat, ReactNode> = {
  bold: <Icon name="bold" className={iconClass} />,
  italic: <Icon name="italic" className={iconClass} />,
  underline: <Icon name="underline" className={iconClass} />,
  strikethrough: <Icon name="strikethrough" className={iconClass} />,
  superscript: (
    <>
      X<sup>2</sup>
    </>
  ),
  subscript: (
    <>
      X<sub>2</sub>
    </>
  ),
  code: <Icon name="code" className={iconClass} />,
};

export default function InlineToolbar({ editor }: { editor: LexicalEditor }) {
  const [toolbar] = useState(() => createInlineToolbar(editor));
  const { visible, formats, left, top, flush } = useStore(toolbar);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => toolbar.register(ref.current as HTMLDivElement), [toolbar]);

  return (
    <Toolbar
      ref={ref}
      className={flush ? flushClass : undefined}
      style={{ left, top, scale: visible ? '1' : undefined }}
    >
      <Controls>
        {INLINE_FORMATS.map((format) => (
          <StyleButton
            key={format}
            active={formats[format]}
            label={labels[format]}
            onToggle={() => toolbar.toggleFormat(format)}
            style={format}
          />
        ))}
      </Controls>
    </Toolbar>
  );
}
