import { splitString } from '../../../../src/data-services/nfl/utils/utils'

describe('Data Service Utils', () => {
    describe('splitString', () => {
      it.each([
        [null, ' ', { firstPart: '', secondPart: '' }],
        ['', ' ', { firstPart: '', secondPart: '' }],
        ['a', ' ', { firstPart: 'a', secondPart: '' }],
        ['hello world!', ' ', { firstPart: 'hello', secondPart: 'world!' }],
        ['hello ', ' ', { firstPart: 'hello', secondPart: '' }],
        [' world!', ' ', { firstPart: '', secondPart: 'world!' }],
        ['hello world!', '-', { firstPart: 'hello world!', secondPart: '' }],
        ['hello world!', ' ', { firstPart: 'hello', secondPart: 'world!' }],
      ])('should parse the string: %s with delimiter: %s', async (input, delimiter, result) => {
            expect(splitString(input, delimiter)).toEqual(result);
      })
    })
});