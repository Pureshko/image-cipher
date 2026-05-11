import { TokenType } from "./Tokenizer.js";

export class Evaluator{
    evaluate(treeNode, env = {}){
        this.env = env;
        return this._visit(treeNode)
    }
    setVars(vars){
        for(const [key, value] of Object.entries(vars)){
            this.env[key] = value;
        }
    }
    _visit(treeNode){
        switch(treeNode.type){
            case "BinaryExpression": return this._visitBinExp(treeNode);
            case "UnaryExpression": return this._visitUnExp(treeNode);
            case "Function": return this._visitFun(treeNode); 
            case "NUMBER": return this._visitNum(treeNode);
            case "VARIABLE": return this._visitVar(treeNode);
        }
    }

    _visitBinExp(node){
        switch(node.operator){
            case TokenType.ADDITION:
                return this._visit(node.left) + this._visit(node.right);
            case TokenType.SUBTRACTION:
                return this._visit(node.left) - this._visit(node.right);
            case TokenType.MULTIPLICATION:
                return this._visit(node.left) * this._visit(node.right);
            case TokenType.DIVISION:
                return this._visit(node.left) / this._visit(node.right);
            case TokenType.EXPONENTIATION:
                return this._visit(node.left) ** this._visit(node.right);
            default:
                throw new Error(`Invalid operation: ${node.operator}`)
        }
    }

    _visitUnExp(node){
        switch(node.operator){
            case TokenType.SUBTRACTION:
                return -this._visit(node.value);
            case TokenType.FACTORIAL:
                return this._factorial(this._visit(node.value))
            default:
                throw new Error(`Invalid operation ${node.operator}`)
        }
    }
    _visitFun(node){
        switch(node.name){
            case "sin":
                return Math.sin(this._visit(node.value));
            case "cos":
                return Math.cos(this._visit(node.value));
            case "tan":
                return Math.tan(this._visit(node.value));
            case "cot": 
                return 1/Math.tan(this._visit(node.value));
            case "ln":
                return Math.log(this._visit(node.value));
            case "log":
                return Math.log10(this._visit(node.value));
            case "exp":
                return Math.exp(this._visit(node.value));
            case "sqrt":
                return Math.sqrt(this._visit(node.value));
            case "abs":
                return Math.abs(this._visit(node.value));
            default:
                throw new Error(`Invalid function ${node.name}`)
        }
    }
    _visitNum(node){
        return node.value;
    }

    _visitVar(node){
        if(!Object.keys(this.env).includes(node.value)){
            throw new Error(`Set up values of your variable ${node.value}`)
        }
        return this.env[node.value];
    }
    _factorial(n) {
        if (n < 0) return undefined; // Factorials are not defined for negative numbers
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

}
