class Lexer {
    constructor() {
        this.palabrasReservadas = [
            'public', 'class', 'static', 'void', 'main', 'String',
            'int', 'double', 'char', 'boolean', 'true', 'false', 'if', 'else',
            'for', 'while', 'System', 'out', 'println'
        ];
        
        //AGREGAR EL PUNTO '.' A LOS SÍMBOLOS
        this.simbolos = ['{', '}', '(', ')', '[', ']', ';', ',', '.', '=', '+', '-', '*', '/', 
                        '==', '!=', '>', '<', '>=', '<=', '++', '--'];
        
        this.tokens = [];
        this.errores = [];
        this.lineaActual = 1;
        this.columnaActual = 1;
        this.codigo = '';
        this.posicion = 0;
    }

    tokenizar(codigo) {
        console.log('=== INICIANDO LEXER ===');
        console.log('Código recibido:', codigo.substring(0, 100) + '...');

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

            } else if (caracterActual === '/' && this.posicion + 1 < this.codigo.length) {
                const siguienteCaracter = this.codigo[this.posicion + 1];
                if (siguienteCaracter === '/') {
                    this.procesarComentarioLinea();
                } else if (siguienteCaracter === '*') {
                    this.procesarComentarioBloque();
                } else {
                    this.procesarSimbolo();
                }

            } else if (caracterActual === "'") {
                this.procesarCaracter();

            } else if (caracterActual === '"') {
                this.procesarCadena();

            } else if (this.esLetra(caracterActual) || caracterActual === '_') {
                this.procesarIdentificador();

            } else if (this.esDigito(caracterActual) || (caracterActual === '-' && this.posicion + 1 < this.codigo.length && this.esDigito(this.codigo[this.posicion + 1]))) {
                this.procesarNumero();

            } else {
                this.procesarSimbolo();
            }
        }

        console.log('=== TOKENS GENERADOS ===');
        console.log(this.tokens);
        console.log('=== ERRORES LÉXICOS ===');
        console.log(this.errores);

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

    procesarComentarioLinea() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = '//';
        
        this.posicion += 2; // Saltar '//'
        this.columnaActual += 2;
        
        //Leer hasta fin de linea
        while (this.posicion < this.codigo.length && this.codigo[this.posicion] !== '\n') {
            lexema += this.codigo[this.posicion];
            this.posicion++;
            this.columnaActual++;
        }
        
        this.agregarToken(lexema, 'COMENTARIO_LINEA', inicioLinea, inicioColumna);
    }

    procesarComentarioBloque() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = '/*';
        
        this.posicion += 2; // Saltar '/*'
        this.columnaActual += 2;
        
        let cerrado = false;
        while (this.posicion < this.codigo.length - 1) {
            if (this.codigo[this.posicion] === '*' && this.codigo[this.posicion + 1] === '/') {
                lexema += '*/';
                this.posicion += 2;
                this.columnaActual += 2;
                cerrado = true;
                break;
            }
            
            if (this.codigo[this.posicion] === '\n') {
                this.lineaActual++;
                this.columnaActual = 1;
            } else {
                this.columnaActual++;
            }
            
            lexema += this.codigo[this.posicion];
            this.posicion++;
        }
        
        if (!cerrado) {
            this.agregarError('Comentario de bloque no cerrado', inicioLinea, inicioColumna);
            return;
        }
        
        this.agregarToken(lexema, 'COMENTARIO_BLOQUE', inicioLinea, inicioColumna);
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

    procesarNumero() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = '';
        let tienePunto = false;
        let esNegativo = false;

        //AFD PARA NUMEROS
        
        //Manejar signo negativo
        if (this.codigo[this.posicion] === '-') {
            lexema += '-';
            this.posicion++;
            this.columnaActual++;
            esNegativo = true;
        }

        //Procesar parte entera
        while (this.posicion < this.codigo.length && this.esDigito(this.codigo[this.posicion])) {
            lexema += this.codigo[this.posicion];
            this.posicion++;
            this.columnaActual++;
        }

        //Verificar si es decimal
        if (this.posicion < this.codigo.length && this.codigo[this.posicion] === '.') {
            lexema += '.';
            this.posicion++;
            this.columnaActual++;
            tienePunto = true;

            //Procesar parte decimal
            let tieneDigitosDecimales = false;
            while (this.posicion < this.codigo.length && this.esDigito(this.codigo[this.posicion])) {
                lexema += this.codigo[this.posicion];
                this.posicion++;
                this.columnaActual++;
                tieneDigitosDecimales = true;
            }

            //Validar decimal mal formado
            if (!tieneDigitosDecimales) {
                this.agregarError('Numero decimal invalido: falta parte decimal', inicioLinea, inicioColumna);
                return;
            }

            //Verificar si hay otro punto / numero mal formado
            if (this.posicion < this.codigo.length && this.codigo[this.posicion] === '.') {
                this.agregarError('Numero decimal invalido: multiples puntos decimales', inicioLinea, inicioColumna);
                return;
            }
        }

        //Validar casos especiales
        if (lexema === '-' || lexema === '.') {
            this.agregarError('Numero mal formado', inicioLinea, inicioColumna);
            return;
        }

        //Determinar tipo de numero
        const tipo = tienePunto ? 'DECIMAL' : 'ENTERO';
        this.agregarToken(lexema, tipo, inicioLinea, inicioColumna);
    }

    //---- AFD LITERALES DE TEXTO ----

    procesarCaracter() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = "'";
        this.posicion++; //Saltar la comilla inicial
        this.columnaActual++;

        //AFD para caracteres: 'x' que es cualquier caracter excepto '
        if (this.posicion >= this.codigo.length) {
            this.agregarError('Caracter no cerrado', inicioLinea, inicioColumna);
            return;
        }

        const caracter = this.codigo[this.posicion];
        lexema += caracter;
        this.posicion++;
        this.columnaActual++;

        if (this.posicion >= this.codigo.length || this.codigo[this.posicion] !== "'") {
            this.agregarError('Caracter mal formado: falta comilla de cierre', inicioLinea, inicioColumna);
            return;
        }

        lexema += "'";
        this.posicion++; // Saltar la comilla final
        this.columnaActual++;

        this.agregarToken(lexema, 'CARACTER', inicioLinea, inicioColumna);
    }

    procesarCadena() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        let lexema = '"';
        this.posicion++; // Saltar la comilla inicial
        this.columnaActual++;

        //AFD para cadenas: "texto" que puede tener cualquier caracter excepto "
        while (this.posicion < this.codigo.length && this.codigo[this.posicion] !== '"') {
            //Manejar saltos de linea dentro de cadenas 
            if (this.codigo[this.posicion] === '\n') {
                this.agregarError('Cadena no cerrada: salto de linea dentro de cadena', inicioLinea, inicioColumna);
                return;
            }

            //Manejar caracteres escapados
            if (this.codigo[this.posicion] === '\\' && this.posicion + 1 < this.codigo.length) {
                lexema += this.codigo[this.posicion]; // la barra invertida
                this.posicion++;
                this.columnaActual++;
                lexema += this.codigo[this.posicion]; // el caracter escapado
                this.posicion++;
                this.columnaActual++;
            } else {
                lexema += this.codigo[this.posicion];
                this.posicion++;
                this.columnaActual++;
            }
        }

        if (this.posicion >= this.codigo.length) {
            this.agregarError('Cadena sin cerrar', inicioLinea, inicioColumna);
            return;
        }

        lexema += '"';
        this.posicion++; // Saltar la comilla final
        this.columnaActual++;

        this.agregarToken(lexema, 'CADENA', inicioLinea, inicioColumna);
    }

    //---- AFD PARA SIMBOLOS Y OPERADORES ----

    procesarSimbolo() {
        const inicioLinea = this.lineaActual;
        const inicioColumna = this.columnaActual;
        const caracterActual = this.codigo[this.posicion];
        let lexema = caracterActual;

        //AFD para simbolos y operadores
        if (this.posicion + 1 < this.codigo.length) {
            const dosCaracteres = caracterActual + this.codigo[this.posicion + 1];
        
            //Operadores de 2 caracteres
            if (dosCaracteres === '==' || dosCaracteres === '!=' || 
                dosCaracteres === '>=' || dosCaracteres === '<=' ||
                dosCaracteres === '++' || dosCaracteres === '--') {
                lexema = dosCaracteres;
                this.posicion += 2;
                this.columnaActual += 2;
                this.agregarToken(lexema, 'OPERADOR', inicioLinea, inicioColumna);
                return;
            }
        }

        //Simbolos de 1 caracter
        if (this.simbolos.includes(caracterActual)) {
            this.posicion++;
            this.columnaActual++;
            this.agregarToken(lexema, 'SIMBOLO', inicioLinea, inicioColumna);
            return;
        }

        //Siempre generar un token, incluso para caracteres no reconocidos
        this.posicion++;
        this.columnaActual++;
    
        //Para caracteres no reconocidos, generar token de tipo DESCONOCIDO
        this.agregarToken(lexema, 'DESCONOCIDO', inicioLinea, inicioColumna);
        this.agregarError(`Carácter no reconocido: '${caracterActual}'`, inicioLinea, inicioColumna);
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