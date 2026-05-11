import {TokenType, Tokenizer} from "./Tokenizer.js";

export class Parser {
    parse(expression){
        this.expr = expression;
        this.tokenizer = new Tokenizer(expression);
        this.current_token = this.tokenizer.getNextToken();
        
        const ast = this.Expr();
        if (this.current_token !== null) {
            throw new SyntaxError(`Unexpected token ${this.current_token.type}`);
        }

        return ast;
    }

    consume(tokenType){
        const token = this.current_token;
        if(this.current_token == null){
            throw new SyntaxError(`Unexpected end of input, expected ${tokenType}`)
        }

        if(this.current_token.type != tokenType){
            throw new SyntaxError(`Unexpected token ${this.current_token.type}, expected ${tokenType}`)
        }
        
        this.current_token = this.tokenizer.getNextToken();
        return token;
    }

    canStartFactor(token){
        return token && (token.type === TokenType.NUMBER ||
           token.type === TokenType.VARIABLE ||
           token.type === TokenType.CONSTANT ||
           token.type === TokenType.FUNCTION ||
           token.type === TokenType.PARENTHESIS_LEFT);
    }
    
    /** 
    * @param {Function} left 
    * @param {Function} right
    * @param {String[] | Function[]} Operations 
    */
    BinExp(leftRule, rightRule, ...Operations){
        // Operations: +,-,*,/,^
        let predicates = Operations.filter((value) => typeof value === "function");
        let tokens = Operations.filter((value) => typeof value === "string" );
        let left = leftRule();
        while(this.current_token){
            if(tokens.includes(this.current_token.type)){
                const operator = this.consume(this.current_token.type).value;
                left = {
                    type: 'BinaryExpression',
                    operator,
                    left,
                    right: rightRule()
                }
                continue
            }
            if(predicates.map((value) => value(this.current_token)).reduce((acc, cur) => acc||cur, false)){
                left = {
                    type: 'BinaryExpression',
                    operator: TokenType.MULTIPLICATION,
                    left,
                    right: rightRule()
                }
                continue;
            }
            break;
        }
        return left;
    }

    FunExp(){ //Function Expression
        // FunExp = sin( E ) | cos( E ) | tan( E ) | log( E ) | ln( E )
        const token = this.current_token;
        this.consume(TokenType.FUNCTION);
        return {
            type: "Function",
            name: token.value,
            value: this.ParExp()
        }
    }

    ParExp(){ //Parenthesis Expression
        this.consume(TokenType.PARENTHESIS_LEFT)
        const expr = this.Expr()
        this.consume(TokenType.PARENTHESIS_RIGHT);
        return expr;
    }

    UnExp(){ //UnaryExpression. Example "-"Factor()
        // UnExp = - F
        this.consume(TokenType.SUBTRACTION)
        return {
            type: "UnaryExpression",
            operator: "-",
            value: this.Factor()
        }
    }

    Postfix(){
        // P' = P ! | P
        let token = this.Prim();

        while(this.current_token && (this.current_token.type === TokenType.FACTORIAL)){
            this.consume(TokenType.FACTORIAL);

            token = {
                type: "UnaryExpression",
                operator: "!",
                value: token
            }
        }
        return token;
    }

    Prim(){ //Primary
        // P = ParExp | UnExp | FunExp | NUMBER | VARIABLE
        if(this.current_token.type === TokenType.PARENTHESIS_LEFT){
            return this.ParExp()
        }
        if(this.current_token.type === TokenType.SUBTRACTION){
            return this.UnExp()
        }
        if(this.current_token.type === TokenType.FUNCTION){
            return this.FunExp()
        }
        if(this.current_token.type === TokenType.VARIABLE){
            const token = this.current_token
            this.consume(TokenType.VARIABLE)
            return token
        }
        if(this.current_token.type === TokenType.NUMBER || this.current_token.type === TokenType.CONSTANT){
            const token = this.current_token
            this.consume(this.current_token.type);
            if(token.type === TokenType.NUMBER){
                token.value = Number(token.value)
            }
            if(token.type === TokenType.CONSTANT){
                switch(token.value){
                    case "pi" : token.value = Math.PI; break;
                    case "e" : token.value = Math.E; break;
                }
            }
            return {
                type: TokenType.NUMBER,
                value: token.value
            };
        }
        throw new SyntaxError(`Unexpected token ${this.current_token?.type}`);
    }

    Factor(){
        // F = P' ^ F 
        return this.BinExp(
            ()=>this.Postfix(),
            ()=>this.Factor(),
            TokenType.EXPONENTIATION
        )
    }

    Term(){
        // T = T * F | T / F | F
        return this.BinExp(
            () => this.Factor(),
            () => this.Factor(),
            TokenType.DIVISION,
            TokenType.MULTIPLICATION,
            this.canStartFactor
        )
    }

    Expr(){ // Expression
        // E = E + T | E - T | T
        return this.BinExp(
            ()=>this.Term(),
            ()=>this.Term(),
            TokenType.ADDITION,
            TokenType.SUBTRACTION
        )
    }
};
