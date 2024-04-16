import { CommandLineOptions } from '@interfaces/command-line/command-line';
import { parseCommandLineOptions } from '@src/service/command-line-parser'

describe('Command Line Parser', () => {
    describe('parseCommandLineOptions', () => {
        it.each([
            [""],
            ["schedule"],
            ["players"],
            ["weeklyOffense"],
            ["weeklyDefense"],
            ["weeklyKick"],
            ["weeklyAdvDefense"],
            ["weeklyAdvPass"],
            ["weeklyAdvRec"],
            ["weeklyAdvRush"],
            ["nextGenPass"],
            ["nextGenRec"],
            ["nextGenRush"],
            ["seasonAdvDef"],
            ["seasonAdvPass"],
            ["seasonAdvRec"],
            ["seasonAdvRush"],
            ["players weeklyOffense weeklyDefense"],
        ])('should parse the args: [%s]', (commandLine) => {            
            const result: CommandLineOptions = {
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
            const args = commandLine.split(" ");
            args.forEach(arg => {
                if (result.hasOwnProperty(arg)) {
                    // @ts-ignore-error
                    result[arg] = true;
                }
            });            
            
            expect(parseCommandLineOptions(args)).toEqual(result);
        })
    })
});