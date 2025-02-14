import cn from 'classnames';
import { createContext, useContext, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from '~/components/Button';
import { Heading1 } from '~/components/Heading';

import type { Route } from './+types';
import setlists from './setlists.json';

type Stats = Record<string, number>;
type SetlistSetType = string[];
type Setlist = {
  date: string;
  sets: SetlistSetType[];
};
type AllSetlists = { setlists: Setlist[]; stats: Stats };

export function loader(): AllSetlists {
  const stats: Stats = {};
  setlists.forEach(({ sets }) => {
    sets.forEach((setlistSet) => {
      setlistSet.forEach((song) => {
        stats[song] ||= 0;
        stats[song] += 1;
      });
    });
  });
  const entries = Object.entries(stats);
  const sortedEntries = entries.sort(([, valueA], [, valueB]) => valueB - valueA);
  const sortedStats = Object.fromEntries(sortedEntries);

  return { setlists, stats: sortedStats };
}

const SetlistState = createContext<{
  currentSong: string;
  setCurrentSong: (song: string) => void;
  stats: Stats;
}>({ currentSong: '', setCurrentSong: () => null, stats: {} });

function Song({ song }: { song: string }) {
  const { currentSong, setCurrentSong, stats } = useContext(SetlistState);
  const isCurrent = currentSong === song;
  return (
    <li
      className={cn('-ml-1 mb-1 cursor-pointer p-1', {
        'bg-pink text-white': isCurrent,
        'bg-detail': !isCurrent && stats[song] === 1,
      })}
      onClick={() => {
        setCurrentSong(currentSong === song ? '' : song);
      }}
    >
      {song}
    </li>
  );
}

function SetlistSet({
  className = '',
  label,
  songs,
}: {
  className?: string;
  label: string;
  songs: string[];
}) {
  return (
    <ul className={className}>
      <li>
        <strong>{label}</strong>
      </li>
      {songs.map((song) => (
        <Song key={song} song={song} />
      ))}
    </ul>
  );
}

export default function Sphere({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const [currentSong, setCurrentSong] = useState('');
  const [showStats, setShowStats] = useState(false);
  const { setlists, stats } = loaderData;
  const entries = Object.entries(stats);
  const totalShows = setlists.length;
  const weekends = Math.ceil(totalShows / 3);
  let songPercentage;
  if (currentSong) {
    const percentage = (stats[currentSong] / totalShows) * 100;
    songPercentage = percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2);
    if (songPercentage === '100') {
      songPercentage = 'played at every show';
    } else {
      songPercentage += `% of ${totalShows} shows across ${weekends} weekends`;
    }
  }
  return (
    <SetlistState.Provider value={{ currentSong, setCurrentSong, stats }}>
      <article className="mt-8">
        <Heading1>{t('sphere.heading')}</Heading1>
        <Button
          className="mb-4"
          onClick={() => {
            setShowStats(!showStats);
          }}
        >
          {showStats ? t('sphere.stats.hide') : t('sphere.stats.show')}
        </Button>
        {currentSong && !showStats && (
          <div className="bg-pink sticky top-0 mb-4 flex justify-between p-2 text-white">
            <p>
              <Trans
                i18nKey="sphere.stats.song"
                values={{ song: currentSong }}
                count={stats[currentSong]}
              />{' '}
              ({stats[currentSong] === weekends ? t('sphere.stats.weekend') : songPercentage}).
            </p>
            <button
              className="mx-3"
              onClick={() => {
                setCurrentSong('');
              }}
            >
              <strong>{'x'}</strong>
            </button>
          </div>
        )}
        {showStats && (
          <div>
            <p>
              <Trans
                i18nKey="sphere.stats.songs"
                values={{ songCount: entries.length, setlistCount: setlists.length }}
              />
            </p>
            <ul className="my-4">
              {entries.map(([song, count]) => (
                <li key={song}>
                  {song}: {count}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {setlists.map(({ date, sets: [set1, set2, encore] }, i) => (
            <div key={i.toString()} className="border-detail border p-2">
              <p className="mb-4 text-lg">
                <strong>{date}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <SetlistSet label={t('sphere.set1')} songs={set1} />
                <div>
                  <SetlistSet className="mb-8" label={t('sphere.set2')} songs={set2} />
                  <SetlistSet label={t('sphere.encore')} songs={encore} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </SetlistState.Provider>
  );
}
