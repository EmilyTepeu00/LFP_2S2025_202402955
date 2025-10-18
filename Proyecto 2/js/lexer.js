class Lexer {
    constructor() {
        this.palabrasReservadas = [
            'public', 'class', 'static', 'void', 'main', 'String', 'args',
            'int', 'double', 'char', 'boolean', 'true', 'false', 'if', 'else',
            'for', 'while', 'System', 'out', 'println'
        ];

        this.simbolos = ['{', '}', '(', ')', '[', ']', ';', ',', '=', '+', '-', '*', '/', 
                        '==', '!=', '>', '<', '>=', '<=', '++', '--'];
        this.tokens = [];
        this.errores = [];
        this.lineaActual = 1;
        this.columnaActual = 1;
    }

    tokenizar(codigo) {
        console.log("Iniciando analisis lexico...")
        this.tokens = [];
        this.errores = [];
        this.lineaActual = 1;
        this.columnaActual = 1;

        return this.tokens;
    }

    obtenerTokens() {
        return this.tokens;
    }

    obtenerErrores() {
        return this.errores;
    }

    limpiar() {
        this.tokens = [];
        this.errores = [];
    }
}