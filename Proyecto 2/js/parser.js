class Parser {
    constructor() {
        this.tokens = [];
        this.indiceTokenActual = 0;
        this.errores = [];
        this.ast = null;
    }

    parsear(tokens) {
        console.log('Iniciando analisis sintactico...');
        this.tokens = tokens;
        this.indiceTokenActual = 0;
        this.errores = [];
        this.ast = null;

        try {
            this.ast = this.parsearPrograma();
            
            //Verificar si hay tokens sobrantes
            if (this.indiceTokenActual < this.tokens.length) {
                const tokenSobrante = this.tokenActual();
                this.agregarError(`Token inesperado: '${tokenSobrante.lexema}'`, tokenSobrante.linea, tokenSobrante.columna);
            }
            
            return this.ast;
            
        } catch (error) {
            console.error('Error en analisis sintactico:', error);
            throw error;
        }
    }

    //PROGRAMA ::= 'public' 'class' ID '{' MAIN '}'
    parsearPrograma() {
        this.coincidirExacto('PALABRA_RESERVADA', 'public', 'Se esperaba "public"');
        this.coincidirExacto('PALABRA_RESERVADA', 'class', 'Se esperaba "class"');
        
        const nombreClase = this.coincidirTipo('IDENTIFICADOR', 'Se esperaba nombre de clase');
        
        this.coincidirExacto('SIMBOLO', '{', 'Se esperaba "{" despues del nombre de clase');
        
        const main = this.parsearMain();
        
        this.coincidirExacto('SIMBOLO', '}', 'Se esperaba "}" al final de la clase');

        return {
            tipo: 'PROGRAMA',
            nombreClase: nombreClase.lexema,
            main: main,
            linea: 1,
            columna: 1
        };
    }

    //MAIN ::= 'public' 'static' 'void' 'main' '(' 'String' '[' ']' ID ')' '{' SENTENCIAS '}'
    parsearMain() {
        this.coincidirExacto('PALABRA_RESERVADA', 'public', 'Se esperaba "public" en metodo main');
        this.coincidirExacto('PALABRA_RESERVADA', 'static', 'Se esperaba "static" en metodo main');
        this.coincidirExacto('PALABRA_RESERVADA', 'void', 'Se esperaba "void" en metodo main');
        this.coincidirExacto('PALABRA_RESERVADA', 'main', 'Se esperaba "main"');
        
        this.coincidirExacto('SIMBOLO', '(', 'Se esperaba "(" despues de main');
        this.coincidirExacto('PALABRA_RESERVADA', 'String', 'Se esperaba "String[]"');
        this.coincidirExacto('SIMBOLO', '[', 'Se esperaba "[" en String[]');
        this.coincidirExacto('SIMBOLO', ']', 'Se esperaba "]" en String[]');
        
        const args = this.coincidirTipo('IDENTIFICADOR', 'Se esperaba nombre de parametro args');
        
        this.coincidirExacto('SIMBOLO', ')', 'Se esperaba ")" despues de args');
        this.coincidirExacto('SIMBOLO', '{', 'Se esperaba "{" despues de main');
        
        const sentencias = this.parsearSentencias();
        
        this.coincidirExacto('SIMBOLO', '}', 'Se esperaba "}" al final de main');

        return {
            tipo: 'MAIN',
            args: args.lexema,
            sentencias: sentencias,
            linea: args.linea,
            columna: args.columna
        };
    }

    //SENTENCIAS ::= SENTENCIA SENTENCIAS | ε
    parsearSentencias() {
        const sentencias = [];
        
        while (this.tokenActual() && 
               this.tokenActual().tipo !== 'SIMBOLO' && 
               this.tokenActual().lexema !== '}') {
            
            const sentencia = this.parsearSentencia();
            if (sentencia) {
                sentencias.push(sentencia);
            }
        }
        
        return sentencias;
    }

    //SENTENCIA ::= DECLARACION / ASIGNACION / IF / FOR / WHILE / PRINT / ';'
    parsearSentencia() {
        const token = this.tokenActual();
        
        if (!token) return null;
        
        //Sentencia vacia / solo punto y coma
        if (token.tipo === 'SIMBOLO' && token.lexema === ';') {
            this.avanzar();
            return {
                tipo: 'SENTENCIA_VACIA',
                linea: token.linea,
                columna: token.columna
            };
        }
        
        //Avanzar sobre tokens desconocidos
        this.avanzar();
        return {
            tipo: 'SENTENCIA_DESCONOCIDA',
            lexema: token.lexema,
            linea: token.linea,
            columna: token.columna
        };
    }

    //---- METODOS AUXILIARES PARA EL PARSER ----

    tokenActual() {
        if (this.indiceTokenActual < this.tokens.length) {
            return this.tokens[this.indiceTokenActual];
        }
        return null;
    }

    avanzar() {
        if (this.indiceTokenActual < this.tokens.length) {
            this.indiceTokenActual++;
        }
    }

    coincidirTipo(tipoEsperado, mensajeError) {
        const token = this.tokenActual();
        if (token && token.tipo === tipoEsperado) {
            this.avanzar();
            return token;
        }
        
        this.agregarError(mensajeError, token ? token.linea : 1, token ? token.columna : 1);
        throw new Error(`Error sintactico: ${mensajeError}`);
    }

    coincidirExacto(tipoEsperado, lexemaEsperado, mensajeError) {
        const token = this.tokenActual();
        if (token && token.tipo === tipoEsperado && token.lexema === lexemaEsperado) {
            this.avanzar();
            return token;
        }
        
        const tokenActual = token ? `'${token.lexema}'` : 'fin de archivo';
        this.agregarError(`${mensajeError}, pero se encontró ${tokenActual}`, 
                         token ? token.linea : 1, token ? token.columna : 1);
        throw new Error(`Error sintactico: ${mensajeError}`);
    }

    mirarAdelante(cantidad = 1) {
        const indice = this.indiceTokenActual + cantidad;
        if (indice < this.tokens.length) {
            return this.tokens[indice];
        }
        return null;
    }

    agregarError(mensaje, linea, columna) {
        this.errores.push({
            mensaje: mensaje,
            linea: linea,
            columna: columna
        });
    }

    obtenerErrores() {
        return this.errores;
    }

    limpiar() {
        this.tokens = [];
        this.errores = [];
        this.indiceTokenActual = 0;
        this.ast = null;
    }
}