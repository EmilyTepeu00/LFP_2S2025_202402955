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
        this.codigo = '';
        this.posicion = 0;
    }

    tokenizar(codigo) {
        this.tokens = [];
        this.errores = [];
        this.lineaActual = 1;
        this.columnaActual = 1;
        this.codigo = codigo;
        this.posicion = 0;

        while (this.posicion < this.codigo.length) {
            const caracterActual = this.codigo[this.posicion];
            
            if (this.esEspacio(caracterActual)) {
                this.procesarEspacio();

            } else if (this.esLetra(caracterActual) || caracterActual === '_') {
                this.procesarIdentificador();

            } else {
                this.posicion++;
                this.columnaActual++;
            }
        }

        return this.tokens;
    }

    esEspacio(caracter) {
        return caracter === ' ' || caracter === '\t' || caracter === '\n' || caracter === '\r';
    }

    esLetra(caracter) {
        return (caracter >= 'a' && caracter <= 'z') || (caracter >= 'A' && caracter <= 'Z');
    }

    esDigito(caracter) {
        return caracter >= '0' && caracter <= '9';
    }

    esLetraODigito(caracter) {
        return this.esLetra(caracter) || this.esDigito(caracter) || caracter === '_';
    }

    procesarEspacio() {
        while (this.posicion < this.codigo.length && this.esEspacio(this.codigo[this.posicion])) {
            if (this.codigo[this.posicion] === '\n') {
                this.lineaActual++;
                this.columnaActual = 1;
            } else {
                this.columnaActual++;
            }
            this.posicion++;
        }
    }

    procesarIdentificador() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = '';

        //AFD para identificadores
        while (this.posicion < this.codigo.length && this.esLetraODigito(this.codigo[this.posicion])) {
            lexema += this.codigo[this.posicion];
            this.posicion++;
            this.columnaActual++;
        }

        //Determinar si es palabra reservada o identificador
        let tipo = 'IDENTIFICADOR';
        if (this.palabrasReservadas.includes(lexema)) {
            tipo = 'PALABRA_RESERVADA';
        }

        this.agregarToken(lexema, tipo, inicioLinea, inicioColumna);
    }

    agregarToken(lexema, tipo, linea, columna) {
        this.tokens.push({
            lexema: lexema,
            tipo: tipo,
            linea: linea,
            columna: columna
        });
    }

    agregarError(mensaje, linea, columna) {
        this.errores.push({
            mensaje: mensaje,
            linea: linea,
            columna: columna
        });
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