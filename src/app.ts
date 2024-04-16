import * as cron from 'node-cron';
import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';
import { parseCommandLineOptions } from '@src/service/command-line-parser';
import { runServices } from '@src/service/services';

const options = parseCommandLineOptions(process.argv.slice(2));
const schedule = '0 0 * * *'; // Run daily at midnight

if (options.schedule) {
  cron.schedule(schedule, () => {
      runServices(options);
      logger.log(`Scheduled service to run at: ${schedule}`, LogContext.Service);
    },
    {
      scheduled: true,
    }
  );
} else {
  // Run service immediately
  runServices(options);
}