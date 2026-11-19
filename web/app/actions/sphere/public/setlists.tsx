import { clientEntry, css, on, type Handle, type RemixNode } from 'remix/component';

import { colorTransition, text } from '../../../ui/public/styles.ts';

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

const grid = (columns: number) =>
  css({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '0.5rem',
  });

// A song, pink when it's the one picked and gray when it was played once
const songItem = css({
  marginBottom: '0.25rem',
  marginLeft: '-0.25rem',
  padding: '0.25rem',
  '&[data-once]': { backgroundColor: 'var(--detail)' },
  '&[data-current]': { backgroundColor: 'var(--pink)', color: '#fff' },
});

const songButton = css({ width: '100%', cursor: 'pointer', textAlign: 'left' });

const statsButton = css({
  marginBottom: '1rem',
  display: 'inline-block',
  height: '1.75rem',
  cursor: 'pointer',
  borderRadius: '0.25rem',
  border: '1px solid var(--gray-400)',
  backgroundColor: 'var(--slate-50)',
  padding: '0 0.625rem 1px',
  verticalAlign: 'top',
  ...text.sm,
  lineHeight: '1.5rem',
  whiteSpace: 'nowrap',
  boxShadow: 'var(--shadow-xs)',
  ...colorTransition,
  '&:hover': {
    borderColor: 'var(--gray-600)',
    backgroundColor: 'var(--slate-100)',
    boxShadow: 'var(--shadow-md)',
  },
  '&:active': { translate: '0 1px' },
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
      let songPercentage = '';
      if (currentSong) {
        const percentage = (stats[currentSong] / totalShows) * 100;
        songPercentage = percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2);
        songPercentage =
          songPercentage === '100'
            ? 'played at every show'
            : `${songPercentage}% of ${totalShows} shows across ${weekends} weekends`;
      }

      const setlistSet = (label: string, songs: string[], spaced = false) => (
        <ul mix={spaced ? css({ marginBottom: '2rem' }) : undefined}>
          <li>
            <strong>{label}</strong>
          </li>
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
          <button
            type="button"
            mix={[
              statsButton,
              on('click', () => {
                showStats = !showStats;
                handle.update();
              }),
            ]}
          >
            {showStats ? messages.hide : messages.show}
          </button>
          {/*
            A ternary, not `{currentSong && …}`: with remix@3.2.0, when a slot holding ''
            becomes an element, the element is appended after its later siblings
            (repro: /dev/slots).
          */}
          {showStats ? (
            <div>
              <p>{markup(messages.songsSummary, {})}</p>
              <ul mix={css({ marginBlock: '1rem' })}>
                {entries.map(([song, count]) => (
                  <li key={song}>
                    {song}: {count}
                  </li>
                ))}
              </ul>
            </div>
          ) : currentSong ? (
            <div
              mix={css({
                position: 'sticky',
                top: 0,
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: 'var(--pink)',
                padding: '0.5rem',
                color: '#fff',
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
                mix={[css({ marginInline: '0.75rem' }), on('click', () => select(currentSong))]}
              >
                <strong>{'x'}</strong>
              </button>
            </div>
          ) : null}
          <div mix={grid(3)}>
            {setlists.map(({ date, sets: [set1, set2, encore] }) => (
              <div
                key={date}
                mix={css({
                  border: '1px solid var(--detail)',
                  padding: '0.5rem',
                })}
              >
                <p mix={css({ marginBottom: '1rem', ...text.lg })}>
                  <strong>{date}</strong>
                </p>
                <div mix={grid(2)}>
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
