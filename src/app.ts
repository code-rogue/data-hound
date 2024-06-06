import * as cron from 'node-cron';
import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';
import { parseCommandLineOptions } from '@src/service/command-line-parser';
import { runServices } from '@src/service/services';

const options = parseCommandLineOptions(process.argv.slice(2));
const schedule = '0 0 * * *'; // Run daily at midnight

async function doWork() {
  try {
    if (options.schedule) {
      logger.log(`Scheduled service to run at: ${schedule}`, LogContext.Service);
      cron.schedule(schedule, () => {
          logger.log(`Executing scheduled service.`, LogContext.Service);
          runServices(options);
        },
        {
          scheduled: true,
        }
      );
    } else {
      await runServices(options);
    }
  }
  catch(error: any) {
    console.error('Error: ', error);
    logger.error('Error: ', error.message, LogContext.Service);
  }
}

doWork().then(() => {
  logger.log(`Completed Data Hound execution.`, LogContext.Service);
});