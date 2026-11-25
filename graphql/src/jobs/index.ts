import { CronJob } from 'cron';

import { createLogger } from '@highforthis/shared/logger';

import { SITE_TIME_ZONE } from '#/time';

import showsData from './shows';
import youtubeData from './youtube';

const logger = createLogger({ serviceName: 'graphql' });

function schedule(name: string, cronTime: string, run: () => Promise<void>) {
  CronJob.from({
    cronTime,
    onTick: run,
    // A run that fails is logged, and the next one still happens
    errorHandler: (error) => logger.error({ err: error, job: name }, 'Scheduled job failed'),
    timeZone: SITE_TIME_ZONE,
    start: true,
  });
}

function jobs(): void {
  schedule('youtube', '0 */4 * * *', youtubeData);
  schedule('shows', '0 0 * * *', showsData);
}

export default jobs;
