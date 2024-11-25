import { CronJob } from 'cron';
import type { Db } from 'mongodb';

import showsData from './shows';
import youtubeData from './youtube';

function jobs(db: Db): void {
  CronJob.from({
    cronTime: '0 */4 * * *',
    onTick: async () => {
      await youtubeData(db);
    },
    timeZone: 'America/New_York',
    start: true,
  });
  CronJob.from({
    cronTime: '0 0 * * *',
    onTick: async () => {
      await showsData(db);
    },
    timeZone: 'America/New_York',
    start: true,
  });
}

export default jobs;
