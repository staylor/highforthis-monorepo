import { clientEntry, css, on, type Handle, type RemixNode } from 'remix/component';

import { panel, quietButton, sm, text } from '#/ui/public/styles.ts';

export type Stats = Record<string, number>;
export type Setlist = { date: string; sets: string[][] };

interface SetlistsProps {
  setlists: Setlist[];
  stats: Stats;
  // i18next doesn't run in the browser here, so the server sends the strings this
  // island needs, including raw templates for the one message built on the client.
  messages: {
    show: string;
    hide: string;
    weekend: string;
    set1: string;
    set2: string;
    encore: string;
    songOne: string;
    songOther: string;
    songsSummary: string;
    everyShow: string;
    /** "{{percentage}}% of {{shows}} shows across {{weekends}} weekends" */
    share: string;
    clear: string;
    /** What picking a song does, and what the shaded ones are */
    hint: string;
  };
}

/** `<strong>` markup in a translated template, without i18next or innerHTML. */
function markup(template: string, values: Record<string, string | number>): RemixNode[] {
  const text = template.replace(/\{\{(\w+)\}\}/g, (_, name) => String(values[name] ?? ''));
  return text.split(/(<strong>.*?<\/strong>)/).map((part) => {
    const match = part.match(/^<strong>(.*)<\/strong>$/);
    return match ? <strong>{match[1]}</strong> : part;
  });
}

// A night's card is at least 20rem wide, so there are as many to a row as fit: one on a phone
const nights = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(20rem, 100%), 1fr))',
  gap: '0.75rem',
});

const night = css({ ...panel, borderRadius: '0.75rem', padding: '1rem' });

const sets = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.75rem',
});

// A song, pink when it's the one picked and shaded when it was played once
const songItem = css({
  marginBottom: '0.125rem',
  marginLeft: '-0.375rem',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.375rem',
  ...text.sm,
  '&:hover': { backgroundColor: 'var(--lift)' },
  '&[data-once]': {
    backgroundColor: 'light-dark(var(--neutral-200), rgb(255 255 255 / 0.12))',
  },
  '&[data-current]': { backgroundColor: 'var(--pink)', color: '#fff' },
});

const songButton = css({ width: '100%', cursor: 'pointer', textAlign: 'left' });

const setName = css({
  marginBottom: '0.25rem',
  ...text.xs,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
});

// How often each song was played, in as many columns as fit
const counts = css({
  marginBlock: '1rem 2rem',
  columnWidth: '16rem',
  columnGap: '2rem',
  ...text.sm,
  '& li': {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    breakInside: 'avoid',
    borderBottom: '1px solid var(--card-border)',
    paddingBlock: '0.25rem',
  },
  '& span': { fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--pink)' },
});

/** The sphere page's setlists, with song highlighting and stats. */
export const Setlists = clientEntry(
  import.meta.url,
  function Setlists(handle: Handle<SetlistsProps>) {
    let currentSong = '';
    let showStats = false;

    const select = (song: string) => {
      currentSong = currentSong === song ? '' : song;
      handle.update();
    };

    return () => {
      const { setlists, stats, messages } = handle.props;
      const entries = Object.entries(stats);
      const totalShows = setlists.length;
      const weekends = Math.ceil(totalShows / 3);
      let songPercentage: RemixNode = '';
      if (currentSong) {
        const share = (stats[currentSong] / totalShows) * 100;
        const percentage = share % 1 === 0 ? share.toFixed(0) : share.toFixed(2);
        songPercentage =
          percentage === '100'
            ? messages.everyShow
            : markup(messages.share, { percentage, shows: totalShows, weekends });
      }

      const setlistSet = (label: string, songs: string[], spaced = false) => (
        <ul mix={spaced ? css({ marginBottom: '1.5rem' }) : undefined}>
          <li mix={setName}>{label}</li>
          {songs.map((song) => (
            <li
              key={song}
              data-current={currentSong === song || undefined}
              data-once={stats[song] === 1 || undefined}
              mix={songItem}
            >
              <button type="button" mix={[songButton, on('click', () => select(song))]}>
                {song}
              </button>
            </li>
          ))}
        </ul>
      );

      return (
        <div>
          <div
            mix={css({
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem 1rem',
            })}
          >
            <button
              type="button"
              aria-expanded={showStats}
              mix={[
                css(quietButton),
                on('click', () => {
                  showStats = !showStats;
                  handle.update();
                }),
              ]}
            >
              {showStats ? messages.hide : messages.show}
            </button>
            <p mix={css({ ...text.sm, color: 'var(--muted)' })}>{messages.hint}</p>
          </div>
          {/*
            A ternary, not `{currentSong && …}`: with remix@3.2.0, when a hydrated slot
            holding '' became an element, the element was appended after its later siblings.
          */}
          {showStats ? (
            <div>
              <p>{markup(messages.songsSummary, {})}</p>
              <ul mix={counts}>
                {entries.map(([song, count]) => (
                  <li key={song}>
                    {song} <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : currentSong ? (
            // Under the site's header, which stays at the top too
            <div
              mix={css({
                position: 'sticky',
                top: '4.5rem',
                zIndex: 10,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--pink)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.75rem 1rem',
                ...text.sm,
                color: '#fff',
                [sm]: text.base,
              })}
            >
              <p>
                {markup(stats[currentSong] === 1 ? messages.songOne : messages.songOther, {
                  song: currentSong,
                  count: stats[currentSong],
                })}{' '}
                ({stats[currentSong] === weekends ? messages.weekend : songPercentage}
                ).
              </p>
              <button
                type="button"
                mix={[
                  css({ cursor: 'pointer', padding: '0 0.25rem' }),
                  on('click', () => select(currentSong)),
                ]}
              >
                <strong>{messages.clear}</strong>
              </button>
            </div>
          ) : null}
          <div mix={nights}>
            {setlists.map(({ date, sets: [set1, set2, encore] }) => (
              <div key={date} mix={night}>
                <p mix={css({ marginBottom: '0.75rem', ...text.lg, fontWeight: 800 })}>{date}</p>
                <div mix={sets}>
                  {setlistSet(messages.set1, set1)}
                  <div>
                    {setlistSet(messages.set2, set2, true)}
                    {setlistSet(messages.encore, encore)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  }
);
