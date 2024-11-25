import { useLoaderData } from '@remix-run/react';
import cn from 'classnames';
import { createContext, useContext, useState } from 'react';

import setlists from './setlists.json';

import Button from '@/components/Button';
import { Heading1 } from '@/components/Heading';

type Stats = Record<string, number>;
type SetlistSetType = string[];
type Setlist = {
  date: string;
  sets: SetlistSetType[];
};
type AllSetlists = { setlists: Setlist[]; stats: Stats };

export const loader = (): AllSetlists => {
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
};

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
      className={cn('mb-1 cursor-pointer p-1 -ml-1', {
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

export default function Sphere() {
  const [currentSong, setCurrentSong] = useState('');
  const [showStats, setShowStats] = useState(false);
  const { setlists, stats } = useLoaderData<typeof loader>();
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
        <Heading1>Dead & Company at the Sphere, Las Vegas, NV</Heading1>
        <Button
          className="mb-4"
          onClick={() => {
            setShowStats(!showStats);
          }}
        >
          {showStats ? 'Hide stats' : 'Show stats'}
        </Button>
        {currentSong && !showStats && (
          <div className="sticky top-0 mb-4 flex justify-between bg-pink p-2 text-white">
            <p>
              "{currentSong}" has been played <strong>{stats[currentSong]}</strong>{' '}
              {stats[currentSong] === 1 ? 'time' : 'times'} (
              {stats[currentSong] === weekends ? 'once per weekend' : songPercentage}).
            </p>
            <button
              className="mx-3"
              onClick={() => {
                setCurrentSong('');
              }}
            >
              <strong>x</strong>
            </button>
          </div>
        )}
        {showStats && (
          <div>
            <p>
              <strong>{entries.length}</strong> songs played total during the residency (
              <strong>{setlists.length}</strong> shows so far).
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
            <div key={i.toString()} className="border border-detail p-2">
              <p className="mb-4 text-lg">
                <strong>{date}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <SetlistSet label="Set 1" songs={set1} />
                <div>
                  <SetlistSet className="mb-8" label="Set 2" songs={set2} />
                  <SetlistSet label="Encore" songs={encore} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </SetlistState.Provider>
  );
}
