import { CommandLineOptions } from '@interfaces/command-line/command-line';
import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';

export function parseCommandLineOptions(args: string[]): CommandLineOptions {
    const options: CommandLineOptions = {
        schedule: false,
        players: false,
        weeklyOffense: false,
        weeklyDefense: false,
        weeklyKick: false,
        weeklyAdvDefense: false,
        weeklyAdvPass: false,
        weeklyAdvRec: false,
        weeklyAdvRush: false,
        nextGenPass: false,
        nextGenRec: false,
        nextGenRush: false,
        seasonAdvDef: false,
        seasonAdvPass: false,
        seasonAdvRec: false,
        seasonAdvRush: false,
    };

    args.forEach(arg => {
        switch (arg) {
            case 'schedule':
                options.schedule = true;
                break;
            case 'players':
                options.players = true;
                break;
            case 'weeklyOffense':
                options.weeklyOffense = true;
                break;
            case 'weeklyDefense':
                options.weeklyDefense = true;
                break;
            case 'weeklyKick':
                options.weeklyKick = true;
                break;
            case 'weeklyAdvDefense':
                options.weeklyAdvDefense = true;
                break;
            case 'weeklyAdvPass':
                options.weeklyAdvPass = true;
                break;
            case 'weeklyAdvRec':
                options.weeklyAdvRec = true;
                break;
            case 'weeklyAdvRush':
                options.weeklyAdvRush = true;
                break;
            case 'nextGenPass':
                options.nextGenPass = true;
                break;
            case 'nextGenRec':
                options.nextGenRec = true;
                break;
            case 'nextGenRush':
                options.nextGenRush = true;
                break;
            case 'seasonAdvDef':
                options.seasonAdvDef = true;
                break;
            case 'seasonAdvPass':
                options.seasonAdvPass = true;
                break;
            case 'seasonAdvRec':
                options.seasonAdvRec = true;
                break;
            case 'seasonAdvRush':
                options.seasonAdvRush = true;
                break;
            default:
                logger.notice(`Unknown option: ${arg}`, LogContext.Service);
        }
    });

    return options;
}