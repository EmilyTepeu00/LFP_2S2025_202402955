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

    //SENTENCIA ::= DECLARACION | ASIGNACION | IF | FOR | WHILE | PRINT | ';'
    parsearSentencia() {
        const token = this.tokenActual();
        
        if (!token) return null;
        
        //Sentencia vacia (solo punto y coma)
        if (token.tipo === 'SIMBOLO' && token.lexema === ';') {
            this.avanzar();
            return {
                tipo: 'SENTENCIA_VACIA',
                linea: token.linea,
                columna: token.columna
            };
        }
        
        //DECLARACION ::= TIPO LISTA_VARS ';'
        if (this.esTipo(token)) {
            return this.parsearDeclaracion();
        }
        
        //ASIGNACION ::= ID '=' EXPRESION ';'
        if (token.tipo === 'IDENTIFICADOR' && this.mirarAdelante() && this.mirarAdelante().lexema === '=') {
            return this.parsearAsignacion();
        }
        
        //IF ::= 'if' '(' EXPRESION ')' '{' SENTENCIAS '}' ('else' '{' SENTENCIAS '}')?
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'if') {
            return this.parsearIf();
        }
        
        //WHILE ::= 'while' '(' EXPRESION ')' '{' SENTENCIAS '}'
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'while') {
            return this.parsearWhile();
        }
        
        //PRINT ::= 'System' '.' 'out' '.' 'println' '(' EXPRESION ')' ';'
        if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'System') {
            return this.parsearPrint();
        }
        
        //Faltaaaaaaa el FOR
        
        //Token no reconocido
        this.agregarError(`Sentencia no reconocida: '${token.lexema}'`, token.linea, token.columna);
        this.avanzar();
        return {
            tipo: 'SENTENCIA_DESCONOCIDA',
            lexema: token.lexema,
            linea: token.linea,
            columna: token.columna
        };
    }

    // IF ::= 'if' '(' EXPRESION ')' '{' SENTENCIAS '}' ('else' '{' SENTENCIAS '}')?
    parsearIf() {
        const inicioLinea = this.tokenActual().linea;
        const inicioColumna = this.tokenActual().columna;
        
        this.coincidirExacto('PALABRA_RESERVADA', 'if', 'Se esperaba "if"');
        this.coincidirExacto('SIMBOLO', '(', 'Se esperaba "(" despues de if');
        
        const condicion = this.parsearExpresion();
        
        this.coincidirExacto('SIMBOLO', ')', 'Se esperaba ")" despues de condicion');
        this.coincidirExacto('SIMBOLO', '{', 'Se esperaba "{" despues de if');
        
        const sentenciasIf = this.parsearSentencias();
        
        this.coincidirExacto('SIMBOLO', '}', 'Se esperaba "}" al final del if');
        
        let sentenciasElse = null;
        if (this.tokenActual() && this.tokenActual().tipo === 'PALABRA_RESERVADA' && this.tokenActual().lexema === 'else') {
            this.avanzar(); // Saltar 'else'
            this.coincidirExacto('SIMBOLO', '{', 'Se esperaba "{" despues de else');
            
            sentenciasElse = this.parsearSentencias();
            
            this.coincidirExacto('SIMBOLO', '}', 'Se esperaba "}" al final del else');
        }

        return {
            tipo: 'IF',
            condicion: condicion,
            sentenciasIf: sentenciasIf,
            sentenciasElse: sentenciasElse,
            linea: inicioLinea,
            columna: inicioColumna
        };
    }

    //WHILE ::= 'while' '(' EXPRESION ')' '{' SENTENCIAS '}'
    parsearWhile() {
        const inicioLinea = this.tokenActual().linea;
        const inicioColumna = this.tokenActual().columna;
        
        this.coincidirExacto('PALABRA_RESERVADA', 'while', 'Se esperaba "while"');
        this.coincidirExacto('SIMBOLO', '(', 'Se esperaba "(" despues de while');
        
        const condicion = this.parsearExpresion();
        
        this.coincidirExacto('SIMBOLO', ')', 'Se esperaba ")" despues de condicion');
        this.coincidirExacto('SIMBOLO', '{', 'Se esperaba "{" despues de while');
        
        const sentencias = this.parsearSentencias();
        
        this.coincidirExacto('SIMBOLO', '}', 'Se esperaba "}" al final del while');

        return {
            tipo: 'WHILE',
            condicion: condicion,
            sentencias: sentencias,
            linea: inicioLinea,
            columna: inicioColumna
        };
    }

    //PRINT ::= 'System' '.' 'out' '.' 'println' '(' EXPRESION ')' ';'
    parsearPrint() {
        const inicioLinea = this.tokenActual().linea;
        const inicioColumna = this.tokenActual().columna;
        
        this.coincidirExacto('PALABRA_RESERVADA', 'System', 'Se esperaba "System"');
        this.coincidirExacto('SIMBOLO', '.', 'Se esperaba "." despues de System');
        this.coincidirExacto('PALABRA_RESERVADA', 'out', 'Se esperaba "out"');
        this.coincidirExacto('SIMBOLO', '.', 'Se esperaba "." despues de out');
        this.coincidirExacto('PALABRA_RESERVADA', 'println', 'Se esperaba "println"');
        this.coincidirExacto('SIMBOLO', '(', 'Se esperaba "(" despues de println');
        
        const expresion = this.parsearExpresion();
        
        this.coincidirExacto('SIMBOLO', ')', 'Se esperaba ")" despues de expresion');
        this.coincidirExacto('SIMBOLO', ';', 'Se esperaba ";" al final de println');

        return {
            tipo: 'PRINT',
            expresion: expresion,
            linea: inicioLinea,
            columna: inicioColumna
        };
    }
    
    //DECLARACION ::= TIPO LISTA_VARS ';'
    parsearDeclaracion() {
        const inicioLinea = this.tokenActual().linea;
        const inicioColumna = this.tokenActual().columna;
        
        const tipo = this.parsearTipo();
        const variables = this.parsearListaVariables();
        
        this.coincidirExacto('SIMBOLO', ';', 'Se esperaba ";" al final de la declaracion');

        return {
            tipo: 'DECLARACION',
            tipoDato: tipo,
            variables: variables,
            linea: inicioLinea,
            columna: inicioColumna
        };
    }

    //LISTA_VARS ::= VAR_DECL (',' VAR_DECL)*
    parsearListaVariables() {
        const variables = [this.parsearVariableDeclaracion()];
        
        while (this.tokenActual() && this.tokenActual().lexema === ',') {
            this.avanzar(); //Saltar la coma
            variables.push(this.parsearVariableDeclaracion());
        }
        
        return variables;
    }

    //VAR_DECL ::= ID ('=' EXPRESION)?
    parsearVariableDeclaracion() {
        const id = this.coincidirTipo('IDENTIFICADOR', 'Se esperaba nombre de variable');
        
        let valorInicial = null;
        if (this.tokenActual() && this.tokenActual().lexema === '=') {
            this.avanzar(); // Saltar '='
            valorInicial = this.parsearExpresion();
        }
        
        return {
            nombre: id.lexema,
            valorInicial: valorInicial,
            linea: id.linea,
            columna: id.columna
        };
    }

    //ASIGNACION ::= ID '=' EXPRESION ';'
    parsearAsignacion() {
        const inicioLinea = this.tokenActual().linea;
        const inicioColumna = this.tokenActual().columna;
        
        const id = this.coincidirTipo('IDENTIFICADOR', 'Se esperaba nombre de variable');
        this.coincidirExacto('SIMBOLO', '=', 'Se esperaba "=" en asignacion');
        
        const expresion = this.parsearExpresion();
        
        this.coincidirExacto('SIMBOLO', ';', 'Se esperaba ";" al final de la asignacion');

        return {
            tipo: 'ASIGNACION',
            variable: id.lexema,
            expresion: expresion,
            linea: inicioLinea,
            columna: inicioColumna
        };
    }

    //EXPRESION ::= TERMINO (('==' | '!=' | '>' | '<' | '>=' | '<=') TERMINO)*
    parsearExpresion() {
        let expresion = this.parsearTermino();
        
        while (this.tokenActual() && this.esOperadorRelacional(this.tokenActual().lexema)) {
            const operador = this.tokenActual();
            this.avanzar();
            const derecho = this.parsearTermino();
            
            expresion = {
                tipo: 'EXPRESION_BINARIA',
                operador: operador.lexema,
                izquierdo: expresion,
                derecho: derecho,
                linea: operador.linea,
                columna: operador.columna
            };
        }
        
        return expresion;
    }

    //TERMINO ::= FACTOR (('+' | '-') FACTOR)*
    parsearTermino() {
        let termino = this.parsearFactor();
        
        while (this.tokenActual() && 
               (this.tokenActual().lexema === '+' || this.tokenActual().lexema === '-')) {
            const operador = this.tokenActual();
            this.avanzar();
            const derecho = this.parsearFactor();
            
            termino = {
                tipo: 'EXPRESION_BINARIA',
                operador: operador.lexema,
                izquierdo: termino,
                derecho: derecho,
                linea: operador.linea,
                columna: operador.columna
            };
        }
        
        return termino;
    }

    //FACTOR ::= PRIMARIO (('*' | '/') PRIMARIO)*
    parsearFactor() {
        let factor = this.parsearPrimario();
        
        while (this.tokenActual() && 
               (this.tokenActual().lexema === '*' || this.tokenActual().lexema === '/')) {
            const operador = this.tokenActual();
            this.avanzar();
            const derecho = this.parsearPrimario();
            
            factor = {
                tipo: 'EXPRESION_BINARIA',
                operador: operador.lexema,
                izquierdo: factor,
                derecho: derecho,
                linea: operador.linea,
                columna: operador.columna
            };
        }
        
        return factor;
    }

    //PRIMARIO ::= ID | LITERAL | '(' EXPRESION ')'
    parsearPrimario() {
        const token = this.tokenActual();
        
        if (!token) {
            throw new Error('Se esperaba una expresion');
        }
        
        //Identificador
        if (token.tipo === 'IDENTIFICADOR') {
            this.avanzar();
            return {
                tipo: 'VARIABLE',
                nombre: token.lexema,
                linea: token.linea,
                columna: token.columna
            };
        }
        
        //Literales
        if (token.tipo === 'ENTERO' || token.tipo === 'DECIMAL' || 
            token.tipo === 'CARACTER' || token.tipo === 'CADENA' ||
            (token.tipo === 'PALABRA_RESERVADA' && (token.lexema === 'true' || token.lexema === 'false'))) {
            
            this.avanzar();
            return {
                tipo: 'LITERAL',
                valor: token.lexema,
                subtipo: token.tipo === 'PALABRA_RESERVADA' ? 'BOOLEANO' : token.tipo,
                linea: token.linea,
                columna: token.columna
            };
        }
        
        //Expresion entre parentesis
        if (token.lexema === '(') {
            this.avanzar(); // Saltar '('
            const expresion = this.parsearExpresion();
            this.coincidirExacto('SIMBOLO', ')', 'Se esperaba ")" despues de expresion');
            return expresion;
        }
        
        throw new Error(`Expresion no valida: '${token.lexema}'`);
    }

    //TIPO ::= 'int' | 'double' | 'char' | 'String' | 'boolean'
    parsearTipo() {
        const token = this.tokenActual();
        if (this.esTipo(token)) {
            this.avanzar();
            return token.lexema;
        }
        throw new Error(`Tipo de dato no soportado: '${token.lexema}'`);
    }

    //---- METODOS AUXILIARES PARA EL PARSER ----

    esTipo(token) {
        return token && token.tipo === 'PALABRA_RESERVADA' && 
               ['int', 'double', 'char', 'String', 'boolean'].includes(token.lexema);
    }

    esOperadorRelacional(operador) {
        return ['==', '!=', '>', '<', '>=', '<='].includes(operador);
    }

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