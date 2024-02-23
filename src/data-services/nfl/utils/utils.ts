export interface StringSplitResult {
    firstPart: string;
    secondPart: string;
}

export function splitString(input: string | null | undefined, delimiter: string): StringSplitResult {
    if (!input || input === '') {
        return { firstPart: '', secondPart: '' };
    }

    const indexOfSpace = input.indexOf(delimiter);

    if (indexOfSpace !== -1) {
        return {
            firstPart: input.substring(0, indexOfSpace),
            secondPart: input.substring(indexOfSpace + 1),
        };
    } else {
        return { firstPart: input, secondPart: '' };
    }
}