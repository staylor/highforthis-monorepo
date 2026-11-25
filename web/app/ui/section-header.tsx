import { css, type Handle, type RemixNode } from 'remix/component';

import { Link } from './link.tsx';
import { colorTransition, md, text } from './public/styles.ts';

/**
 * The heading over a section of a page, with a link beside it to everything the section has some
 * of, and a note under it. The link goes under the heading where they don't fit side by side.
 */
export function SectionHeader(
  handle: Handle<{
    label: string;
    viewAllLink?: string;
    viewAllText?: string;
    note?: RemixNode;
  }>
) {
  return () => {
    const { label, viewAllLink, viewAllText, note } = handle.props;
    return (
      <div mix={css({ marginBottom: '1.5rem', [md]: { marginBottom: '2rem' } })}>
        <div
          mix={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '0.25rem 1rem',
          })}
        >
          <h2
            mix={css({
              ...text.xl,
              fontWeight: 900,
              textTransform: 'uppercase',
              [md]: text['2xl'],
            })}
          >
            {label}
          </h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              mix={css({
                ...text.sm,
                fontWeight: 500,
                letterSpacing: '0.025em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                ...colorTransition,
                '&:hover': { color: 'var(--pink)' },
              })}
            >
              {viewAllText}
            </Link>
          )}
        </div>
        {note && (
          <p mix={css({ marginTop: '0.25rem', ...text.sm, color: 'var(--muted)' })}>{note}</p>
        )}
      </div>
    );
  };
}

/** A pink line that fades out at both ends. */
export function AccentLine() {
  return () => (
    <div
      mix={css({
        marginBlock: '2rem',
        height: 1,
        flex: '1 1 0%',
        background: 'linear-gradient(90deg, transparent, #e50082, transparent)',
        [md]: { marginBlock: '3rem' },
      })}
    />
  );
}
