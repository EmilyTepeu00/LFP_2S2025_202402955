//TIPOS DE TOKENS
const TipoToken = {
    TORNEO: 'PALABRA_RESERVADA_TORNEO',
    EQUIPOS: 'PALABRA_RESERVADA_EQUIPOS',
    ELIMINACION: 'PALABRA_RESERVADA_ELIMINACION',
    EQUIPO: 'PALABRA_RESERVADA_EQUIPO',
    JUGADOR: 'PALABRA_RESERVADA_JUGADOR',
    PARTIDO: 'PALABRA_RESERVADA_PARTIDO',
    GOL: 'PALABRA_RESERVADA_GOL',
    RESULTADO: 'PALABRA_RESERVADA_RESULTADO',
    FASE: 'PALABRA_RESERVADA_FASE',

    NOMBRE: 'ATRIBUTO_NOMBRE',
    EQUIPOS_COUNT: 'ATRIBUTO_EQUIPOS',
    SEDE: 'ATRIBUTO_SEDE',
    POSICION: 'ATRIBUTO_POSICION',
    NUMERO: 'ATRIBUTO_NUMERO',
    EDAD: 'ATRIBUTO_EDAD',
    MINUTO: 'ATRIBUTO_MINUTO',

    PORTERO: 'VALOR_PORTERO',
    DEFENSA: 'VALOR_DEFENSA',
    MEDIOCAMPO: 'VALOR_MEDIOCAMPO',
    DELANTERO: 'VALOR_DELANTERO',

    LLAVE_IZQ: 'LLAVE_IZQUIERDA',
    LLAVE_DER: 'LLAVE_DERECHA',
    CORCHETE_IZQ: 'CORCHETE_IZQUIERDA',
    CORCHETE_DER: 'CORCHETE_DERECHA',
    PARENTESIS_IZQ: 'PARENTESIS_IZQUIERDA',
    PARENTESIS_DER: 'PARENTESIS_DERECHA',
    DOS_PUNTOS: 'DOS_PUNTOS',
    COMA: 'COMA',
    COMILLAS: 'ATRIBUCOMILLASTO_',
    VS: 'VS',

    CADENA: 'CADENA',
    NUMERO: 'NUMERO',
    IDENTIFICADOR: 'IDENTIFICADOR',
    EOF: 'EOF'
};

//PALABRAS RESERVADAS CON SU TIPO DE TOKEN
const PalabrasReservadas = {
    'torneo': TokenType.TORNEO,
    'equipos': TokenType.EQUIPOS,
    'eliminacion': TokenType.ELIMINACION,
    'equipo': TokenType.EQUIPO,
    'jugador': TokenType.JUGADOR,
    'partido': TokenType.PARTIDO,
    'goleador': TokenType.GOL,
    'resultado': TokenType.RESULTADO,
    'nombre': TokenType.NOMBRE,
    'sede': TokenType.SEDE,
    'posicion': TokenType.POSICION,
    'numero': TokenType.NUMERO,
    'edad': TokenType.EDAD,
    'minuto': TokenType.MINUTO,
    'vs': TokenType.VS,
    'portero': TokenType.PORTERO,
    'defensa': TokenType.DEFENSA,
    'mediocampo': TokenType.MEDIOCAMPO,
    'delantero': TokenType.DELANTERO,
};

//TOKEN ENCONTRADO DURANTE EL ANALISIS LEXICO
class Token {
    constructor(tipo, valor, linea, columna) {
        this.tipo = tipo;
        this.valor = valor;
        this.linea = linea;
        this.columna = columna;
    }   
}

//ERROR LEXICO ENCONTRADO DURANTE EL ANALISIS
class ErrorLexico {
    constructor(lexema, tipoError, descripcion, linea, columna) {
        this.lexema = lexema;
        this.tipoError = tipoError;
        this.descripcion = descripcion;
        this.linea = linea;
        this.columna = columna;
    }
}

//CLASE PRINCIPAL DEL ANALIZADOR LEXICO
class AnalizadorLexico {
    constructor(codigoFuente) {
        this.fuente = codigoFuente;
        this.posicion = 0;
        this.linea = 1;
        this.columna = 1;
        this.tokens = [];
        this.errores = [];
    }

    //FUNCION PARA INICIAR EL ANALISIS LEXICO
    analizar() {
        console.log("Iniciando analisis lexico...");
        this.tokens = [];
        this.errores = [];

        while (this.posicion < this.fuente.length) {
            const posicionInicial = this.posicion;
            const lineaInicial = this.linea;
            const columnaInicial = this.columna;

            const caracter = this.fuente[this.posicion];

            if (this.esEspacioEnBlanco(caracter)) {
                this.saltarEspaciosEnBlanco();
                continue;
            }

            if (caracter === '/' && this.siguienteCaracter() === '/') {
                this.saltarComentario();
                continue;
            }

            let token = null;
            token = this.verificarSimbolosUnCaracter(caracter);

            if (token) {
                this.tokens.push(token);
                this.avanzar();
                continue;
            }

            if (this.esDigito(caracter)) {
                token = this.leerNumero();
                    if (token) this.tokens.push(token);
                    continue;
            }

            if (caracter === '"') {
                token = this.leerCadena();
                if (token) this.tokens.push(token);
                continue;
            }

            if (this.esLetra(caracter)) {
                token = this.leerIdentificador();
                if (token) this.tokens.push(token);
                continue;
            }

            this.errores.push(new ErrorLexico(
                caracter,
                "Simbolo inesperado",
                `Carácter '${caracter}' no reconocido en el lenguaje.`,
                lineaInicial,
                columnaInicial
            ));
            this.avanzar();
        }

        this.tokens.push(new Token(TipoToken.EOF, "EOF", this.linea, this.columna));

        console.log("Analisis lexico completado");
        console.log(`Tokens encontrados: ${this.tokens.length}`);
        console.log(`Errores encontrados: ${this.errores.length}`);

        return {
            tokens: this.tokens,
            errores: this.errores
        };
    }

    //FUNCIONES AUXILIARES PARA EL AFD

    avanzar(){
        if (this.fuente[this.posicion] === '\n') {
            this.linea++;
            this.columna = 1;
        } else {
            this.columna++;
        }
        this.posicion++;
    }

    siguienteCaracter(desplazamiento = 1) {
        const posicionSiguiente = this.posicion + desplazamiento;
        if (posicionSiguiente >= this.fuente.length) return '\0';
        return this.fuente[posicionSiguiente];
    }

    esEspacioEnBlanco(caracter) {
        return caracter === ' ' || caracter === '\t' || caracter === '\n' || caracter === '\r';
    }

    saltarEspaciosEnBlanco() {
        while (this.posicion < this.fuente.length && this.esEspacioEnBlanco(this.fuente[this.posicion])) {
            this.avanzar();
        }
    }

    saltarComentario() {
        this.avanzar(); //primer /
        this.avanzar(); //segundo /

        while (this.posicion < this.fuente.length && this.fuente[this.posicion] !== '\n') {
            this.avanzar();
        }

        if (this.fuente[this.posicion] === '\n') {
            this.avanzar();
        }
    }

    esDigito(caracter) {
        return caracter >= '0' && caracter <= '9';
    }

    esLetra(caracter) {
        return (caracter >= 'a' && caracter <= 'z') || (caracter >= 'A' && caracter <= 'Z') || 
               caracter === 'á' || caracter === 'é' || caracter === 'í' || caracter === 'ó' || caracter === 'ú' ||
               caracter === 'Á' || caracter === 'É' || caracter === 'Í' || caracter === 'Ó' || caracter === 'Ú' ||
               caracter === 'ñ' || caracter === 'Ñ';
    }

    esCaracterIdentificador(caracter) {
        return this.esLetra(caracter) || this.esDigito(caracter) || caracter === '_' || caracter === ' ';
    }

    //LECTURA DE TOKENS ESPECIFICOS
    verificarSimbolosUnCaracter(caracter) {
        const lineaInicial = this.linea;
        const columnaInicial = this.columna;

        let TipoToken = null;
        switch (caracter) {
            case '{': TipoToken = TipoToken.LLAVE_IZQ; break;
            case '}': TipoToken = TipoToken.LLAVE_DER; break;
            case '[': TipoToken = TipoToken.CORCHETE_IZQ; break;
            case ']': TipoToken = TipoToken.CORCHETE_DER; break;
            case '(': TipoToken = TipoToken.PARENTESIS_IZQ; break;
            case ')': TipoToken = TipoToken.PARENTESIS_DER; break;
            case ':': TipoToken = TipoToken.DOS_PUNTOS; break;
            case ',': TipoToken = TipoToken.COMA; break;
            default: return null;
        }

        return new Token(TipoToken, caracter, lineaInicial, columnaInicial);
    }

    leerNumero() {
        const lineaInicial = this.linea;
        const columnaInicial = this.columna;
        let valor = '';

        while (this.posicion < this.fuente.length && this.esDigito(this.fuente[this.posicion])) {
            valor += this.fuente[this.posicion];
            this.avanzar();
        }

        return new Token(TipoToken.NUMERO, valor, lineaInicial, columnaInicial);
    }

    leerCadena() {
        const lineaInicial = this.linea;
        const columnaInicial = this.columna;

        this.avanzar(); //Saltar la comilla inicial
        let valor = '';
        let caracterEscapado = false;

        while (this.posicion < this.fuente.length) {
            const caracter = this.fuente[this.posicion];

            if (caracterEscapado) {
                valor += caracter;
                caracterEscapado = false;
                this.avanzar();
            } else if (caracter === '\\') {
                caracterEscapado = true;
                this.avanzar();
            } else if (caracter === '"') {
                this.avanzar(); //Saltar la comilla final
                return new Token(TipoToken.CADENA, valor, lineaInicial, columnaInicial);
            } else if (caracter === '\n') {
                this.errores.push(new ErrorLexico(
                    valor + caracter,
                    "Cadena no cerrada",
                    "Se encontró un salto de linea antes de cerrar la cadena con comillas",
                    lineaInicial,
                    columnaInicial
                ));
                this.avanzar();
                return null;
            } else {
                valor += caracter;
                this.avanzar();
            }
        }

        this.errores.push(new ErrorLexico(
            valor,
            "Cadena no cerrada",
            "El archivo terminó antes de cerrar la cadena con comillas",
            lineaInicial,
            columnaInicial
        ));
        return null;
    }

    leerIdentificador() {
        const lineaInicial = this.linea;
        const columnaInicial = this.columna;
        let valor = '';

        while (this.posicion < this.fuente.length && this.esCaracterIdentificador(this.fuente[this.posicion])) {
            valor += this.fuente[this.posicion];
            this.avanzar();
        }

        valor = valor.trim();
        const valorMinusculas = valor.toLowerCase();

        if (PalabrasReservadas.hasOwnProperty(valorMinusculas)) {
            return new Token(PalabrasReservadas[valorMinusculas], valor, lineaInicial, columnaInicial);
        } else {
            return new Token(TipoToken.IDENTIFICADOR, valor, lineaInicial, columnaInicial);
        }
    }
}   
