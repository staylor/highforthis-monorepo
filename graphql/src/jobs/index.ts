import { CronJob } from 'cron';

import showsData from './shows';
import youtubeData from './youtube';

function jobs(): void {
  CronJob.from({
    cronTime: '0 */4 * * *',
    onTick: async () => {
      await youtubeData();
    },
    timeZone: 'America/New_York',
    start: true,
  });
  CronJob.from({
    cronTime: '0 0 * * *',
    onTick: async () => {
      await showsData();
    },
    timeZone: 'America/New_York',
    start: true,
  });
}

export default jobs;
