class Parser {
    constructor() {
        this.tokens = [];
        this.indiceTokenActual = 0;
        this.errores = [];
        this.ast = null;
    }

    parsear(tokens) {
        console.log("Iniciando analisis sintactico...");
        this.tokens = tokens;
        this.indiceTokenActual = 0;
        this.errores = [];
        this.ast = null;

        return this.ast;
    }

    obtenerErrores() {
        return this.errores;
    }

    tokenActual() {
        if (this.indiceTokenActual < this.tokens.length) {
            return this.tokens[this.indiceTokenActual];
        }
        return null;
    }

    avanzar() {
        this,this.indiceTokenActual++;
    }

    coincidir(tipoEsperado) {
        const token = this.tokenActual();
        if (token && token.tipo === tipoEsperado) {
            this.avanzar();
            return true;
        }
        return false;
    }
}