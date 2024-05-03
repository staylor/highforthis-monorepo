import type { Db } from 'mongodb';
import { CronJob } from 'cron';

import youtubeData from './youtube';

function jobs(db: Db): void {
  CronJob.from({
    cronTime: '*/45 * * * *',
    onTick: async () => {
      await youtubeData(db);
    },
    timeZone: 'America/New_York',
    start: true,
  });
}

export default jobs;
