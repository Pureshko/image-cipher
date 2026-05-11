export const TokenType = {
    NUMBER: 'NUMBER',
    FUNCTION: 'FUNCTION',
    VARIABLE: 'VARIABLE',
    CONSTANT: 'CONSTANT',
    ADDITION: '+',
    SUBTRACTION: '-',
    MULTIPLICATION: '*',
    DIVISION: '/',
    EXPONENTIATION: '^',
    PARENTHESIS_LEFT: '(',
    PARENTHESIS_RIGHT: ')',
    FACTORIAL: '!'
};

const TokenRegex = {
    NUMBER: /^\d+(\.\d+)?/,
    FUNCTION: /^(sin|cos|tan|cot|ln|log|exp|sqrt|abs)/,
    CONSTANT: /^(pi|e)/,
    VARIABLE: /^\w/,
    ADDITION: /^\+/,
    SUBTRACTION: /^\-/,
    MULTIPLICATION: /^\*/,
    DIVISION: /^\//,
    EXPONENTIATION: /^\^/,
    PARENTHESIS_LEFT: /^\(/,
    PARENTHESIS_RIGHT: /^\)/,
    FACTORIAL: /^\!/
};

export class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    };

    toString() {
        return `Token(${this.type}, ${this.value})`;
    }
}

export class Tokenizer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }
    match(regex, input){
        const match = regex.exec(input);
        if (match === null) {
            return null;
        }

        this.position += match[0].length;
        return match[0];
    }
    getNextToken() {
        if (this.position >= this.input.length) {
            return null;
        }
        const remainingInput = this.input.slice(this.position);
        for (const [type, regex] of Object.entries(TokenRegex)) {
            const match = this.match(regex, remainingInput);
            
            if (match) {
                return new Token(TokenType[type], match);
            }

        }
        throw new Error(`Unexpected token at position ${this.position}: ${remainingInput[0]}`);
    }

    tokenize() {
        const tokens = [];
        let token;
        while ((token = this.getNextToken()) !== null) {
            tokens.push(token);
        }
        return tokens;
    }
}