import { parseNumber, splitString } from '../../../../src/data-services/utils/utils'

describe('Data Service Utils', () => {
    describe('splitString', () => {
      it.each([
        [null, ' ', { firstPart: '', secondPart: '' }],
        [undefined, ' ', { firstPart: '', secondPart: '' }],
        ['', ' ', { firstPart: '', secondPart: '' }],
        ['a', ' ', { firstPart: 'a', secondPart: '' }],
        ['hello world!', ' ', { firstPart: 'hello', secondPart: 'world!' }],
        ['hello ', ' ', { firstPart: 'hello', secondPart: '' }],
        [' world!', ' ', { firstPart: '', secondPart: 'world!' }],
        ['hello world!', '-', { firstPart: 'hello world!', secondPart: '' }],
        ['hello world!', ' ', { firstPart: 'hello', secondPart: 'world!' }],
      ])('should parse the string: %s with delimiter: %s', (input, delimiter, result) => {
            expect(splitString(input, delimiter)).toEqual(result);
      })
    })

    describe('parseNumber', () => {
      it.each([
        [null, 0],
        [undefined, 0],
        [5, 5],
        [22.5, 22.5],
        [-2.5, -2.5],
        [-5, -5],
        ['1.5', 1.5],
        ['-99.9', -99.9],
        ['a', 0],
        ['1-0', 0],
        ['1.0.0', 0],
      ])('should parse the input: %s to result: %s', (input, result) => {
            expect(parseNumber(input)).toEqual(result);
      })
    })
});