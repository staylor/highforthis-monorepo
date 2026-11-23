import { css, type Handle } from 'remix/component';

import { Link } from './link.tsx';
import { colorTransition, md, text } from './public/styles.ts';

export function SectionHeader(
  handle: Handle<{ label: string; viewAllLink: string; viewAllText: string }>
) {
  return () => {
    const { label, viewAllLink, viewAllText } = handle.props;
    return (
      <div
        mix={css({
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          [md]: { marginBottom: '2.5rem' },
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
        <Link
          href={viewAllLink}
          mix={css({
            ...text.sm,
            fontWeight: 500,
            letterSpacing: '0.025em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            ...colorTransition,
            '&:hover': { color: 'var(--pink)' },
          })}
        >
          {viewAllText}
        </Link>
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
