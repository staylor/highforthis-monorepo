import { clientEntry, on, type Handle, type RemixNode } from 'remix/component';

import { cn } from '../../../ui/public/cn.ts';

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

      const setlistSet = (label: string, songs: string[], className = '') => (
        <ul class={className}>
          <li>
            <strong>{label}</strong>
          </li>
          {songs.map((song) => (
            <li
              key={song}
              class={cn('mb-1 -ml-1 p-1', {
                'bg-pink text-white': currentSong === song,
                'bg-detail': currentSong !== song && stats[song] === 1,
              })}
            >
              <button
                type="button"
                class="w-full cursor-pointer text-left"
                mix={on('click', () => select(song))}
              >
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
            class="mb-4 inline-block h-7 cursor-pointer rounded border border-gray-400 bg-slate-50 px-2.5 pb-px align-top text-sm leading-6 whitespace-nowrap shadow-xs transition-colors hover:border-gray-600 hover:bg-slate-100 hover:shadow-md active:translate-y-px"
            mix={on('click', () => {
              showStats = !showStats;
              handle.update();
            })}
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
              <ul class="my-4">
                {entries.map(([song, count]) => (
                  <li key={song}>
                    {song}: {count}
                  </li>
                ))}
              </ul>
            </div>
          ) : currentSong ? (
            <div class="sticky top-0 mb-4 flex justify-between bg-pink p-2 text-white">
              <p>
                {markup(stats[currentSong] === 1 ? messages.songOne : messages.songOther, {
                  song: currentSong,
                  count: stats[currentSong],
                })}{' '}
                ({stats[currentSong] === weekends ? messages.weekend : songPercentage}).
              </p>
              <button type="button" class="mx-3" mix={on('click', () => select(currentSong))}>
                <strong>{'x'}</strong>
              </button>
            </div>
          ) : null}
          <div class="grid grid-cols-3 gap-2">
            {setlists.map(({ date, sets: [set1, set2, encore] }) => (
              <div key={date} class="border border-detail p-2">
                <p class="mb-4 text-lg">
                  <strong>{date}</strong>
                </p>
                <div class="grid grid-cols-2 gap-2">
                  {setlistSet(messages.set1, set1)}
                  <div>
                    {setlistSet(messages.set2, set2, 'mb-8')}
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
