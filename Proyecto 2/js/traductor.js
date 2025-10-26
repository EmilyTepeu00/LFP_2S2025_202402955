class Traductor {
    constructor() {
        this.codigoPython = '';
        this.nivelIndentacion = 0;
        this.variablesDeclaradas = new Set();
    }

    //TRADUCIR EL AST COMPLETO DE Java -> Python
    traducir(ast) {
        this.codigoPython = '';
        this.nivelIndentacion = 0;
        this.variablesDeclaradas.clear();

        if (!ast) {
            return '#Error: No se pudo generar el AST\n';
        }

        this.agregarLinea('#Traducido de Java a Python');
        this.agregarLinea('');

        this.traducirPrograma(ast);

        return this.codigoPython;
    }

    //TRADUCIR LA ESTRUCTURA PRINCIPAL
    traducirPrograma(programa) {
        this.agregarLinea(`#Clase: ${programa.nombreClase}`);
        this.agregarLinea('');
        this.traducirMain(programa.main);
    }

    //TRADUCIR EL METODO MAIN (en python se ejecuta directamente)
    traducirMain(main) {
        this.traducirSentencias(main.sentencias);
    }

    //PROCESAR UNA LISTA DE SENTENCIAS
    traducirSentencias(sentencias) {
        for (const sentencia of sentencias) {
            this.traducirSentencia(sentencia);
        }
    }

    //DISTRIBUIR LA TRADUCCION SEGUN EL TIPO DE SENTENCIA
    traducirSentencia(sentencia) {
        switch (sentencia.tipo) {
            case 'DECLARACION':
                this.traducirDeclaracion(sentencia);
                break;
            case 'ASIGNACION':
                this.traducirAsignacion(sentencia);
                break;
            case 'IF':
                this.traducirIf(sentencia);
                break;
            case 'WHILE':
                this.traducirWhile(sentencia);
                break;
            case 'PRINT':
                this.traducirPrint(sentencia);
                break;
            case 'FOR':
                this.traducirFor(sentencia);
                break;
            case 'SENTENCIA_VACIA':
                //Ignorar punto y coma vacio
                break;
            default:
                this.agregarLinea(`#Sentencia no traducida: ${sentencia.tipo}`);
        }
    }

    //TRADUCIR DECLARACIONES DE VARIABLES: int x = 5;
    traducirDeclaracion(declaracion) {
        for (const variable of declaracion.variables) {
            const nombreVar = variable.nombre;
            this.variablesDeclaradas.add(nombreVar);
            
            //Valor por defecto o valor inicial
            let valorPython = this.obtenerValorPorDefecto(declaracion.tipoDato);
            if (variable.valorInicial) {
                valorPython = this.traducirExpresion(variable.valorInicial);
            }
            
            const comentario = `#Declaracion: ${declaracion.tipoDato}`;
            this.agregarLinea(`${nombreVar} = ${valorPython} ${comentario}`);
        }
    }

    //TRADUCIR ASIGNACIONES: x = 10;
    traducirAsignacion(asignacion) {
        const valorPython = this.traducirExpresion(asignacion.expresion);
        this.agregarLinea(`${asignacion.variable} = ${valorPython}`);
    }

    //TRADUCIR if-else CON IDENTACION
    traducirIf(sentenciaIf) {
        const condicion = this.traducirExpresion(sentenciaIf.condicion);
        this.agregarLinea(`if ${condicion}:`);
        
        this.aumentarIndentacion();
        this.traducirSentencias(sentenciaIf.sentenciasIf);
        this.disminuirIndentacion();
        
        if (sentenciaIf.sentenciasElse) {
            this.agregarLinea('else:');
            this.aumentarIndentacion();
            this.traducirSentencias(sentenciaIf.sentenciasElse);
            this.disminuirIndentacion();
        }
    }

    //TRADUCIR WHILE LOOPS
    traducirWhile(sentenciaWhile) {
        const condicion = this.traducirExpresion(sentenciaWhile.condicion);
        this.agregarLinea(`while ${condicion}:`);
        
        this.aumentarIndentacion();
        this.traducirSentencias(sentenciaWhile.sentencias);
        this.disminuirIndentacion();
    }

    //TRADUCIR System.out.println -> print()
    traducirPrint(sentenciaPrint) {
        const expresion = this.traducirExpresion(sentenciaPrint.expresion);
        
        //Conversion automatica a string si es necesario
        if (this.necesitaConversionString(sentenciaPrint.expresion)) {
            this.agregarLinea(`print(str(${expresion}))`);
        } else {
            this.agregarLinea(`print(${expresion})`);
        }
    }

    //CONVERTIR for loops -> while loops
    traducirFor(sentenciaFor) {
        //Inicializacion: int i = 0
        const initVar = sentenciaFor.inicializacion.variable;
        const initVal = this.traducirExpresion(sentenciaFor.inicializacion.expresion);
        const condicion = this.traducirExpresion(sentenciaFor.condicion);
        
        this.agregarLinea(`${initVar} = ${initVal}`);
        this.agregarLinea(`while ${condicion}:`);
        
        this.aumentarIndentacion();
        this.traducirSentencias(sentenciaFor.sentencias);
        
        //Actualizacion: i++ o i--
        const op = sentenciaFor.actualizacion.operador;
        const varUpdate = sentenciaFor.actualizacion.variable;
        
        if (op === '++') {
            this.agregarLinea(`${varUpdate} += 1`);
        } else if (op === '--') {
            this.agregarLinea(`${varUpdate} -= 1`);
        }
        
        this.disminuirIndentacion();
    }

    //TRADUCIR EXPRESIONES (variables, literales, operaciones)
    traducirExpresion(expresion) {
        switch (expresion.tipo) {
            case 'VARIABLE':
                return expresion.nombre;
            case 'LITERAL':
                return this.traducirLiteral(expresion);
            case 'EXPRESION_BINARIA':
                return this.traducirExpresionBinaria(expresion);
            default:
                return `#Expresion no traducida: ${expresion.tipo}`;
        }
    }

    //CONVERTIR LITERALES DE Java -> Python
    traducirLiteral(literal) {
        switch (literal.subtipo) {
            case 'ENTERO':
            case 'DECIMAL':
                return literal.valor; //Numeros iguales
            case 'CARACTER':
                return `'${literal.valor.replace(/'/g, "\\'")}'`; // 'a' → 'a'
            case 'CADENA':
                return `"${literal.valor.replace(/"/g, '\\"')}"`; // "hola" -> "hola"
            case 'BOOLEANO':
                return literal.valor === 'true' ? 'True' : 'False'; // true -> True
            default:
                return literal.valor;
        }
    }

    //TRADUCIR OPERACIONES (+, -, *, /, ==)
    traducirExpresionBinaria(expresion) {
        const izquierdo = this.traducirExpresion(expresion.izquierdo);
        const derecho = this.traducirExpresion(expresion.derecho);
        
        //Manejo para concatenaciones
        if (expresion.operador === '+') {
            const izqEsNum = this.esNumero(expresion.izquierdo);
            const derEsNum = this.esNumero(expresion.derecho);
            const izqEsBool = this.esBooleano(expresion.izquierdo);
            const derEsBool = this.esBooleano(expresion.derecho);
            
            if ((izqEsNum || izqEsBool) && (derEsNum || derEsBool)) {
                return `(${izquierdo} ${expresion.operador} ${derecho})`; // 5 + 3
            } else {
                return `str(${izquierdo}) + str(${derecho})`; // "a" + 5 -> "a" + str(5)
            }
        }
        
        return `(${izquierdo} ${expresion.operador} ${derecho})`; //Operaciones normales
    }

    //OBTENER VALORES POR DEFECTO PARA CADA TIPO
    obtenerValorPorDefecto(tipoJava) {
        const valoresPorDefecto = {
            'int': '0',
            'double': '0.0', 
            'char': "''",
            'String': '""',
            'boolean': 'False'
        };
        return valoresPorDefecto[tipoJava] || 'None';
    }

    //VERIFICAR SI UNA EXPRESION NECESITA CONVERSION a string en print
    necesitaConversionString(expresion) {
        return expresion.tipo === 'VARIABLE' || 
               (expresion.tipo === 'LITERAL' && 
                (expresion.subtipo === 'ENTERO' || expresion.subtipo === 'DECIMAL' || expresion.subtipo === 'BOOLEANO'));
    }


    //METODOS AUXILIARES PARA VERIFICACION DE TIPOS
    esNumero(expresion) {
        return expresion.tipo === 'LITERAL' && 
               (expresion.subtipo === 'ENTERO' || expresion.subtipo === 'DECIMAL');
    }

    esBooleano(expresion) {
        return expresion.tipo === 'LITERAL' && expresion.subtipo === 'BOOLEANO';
    }

    //Manejo de identacion
    agregarLinea(linea) {
        const indentacion = '    '.repeat(this.nivelIndentacion);
        this.codigoPython += indentacion + linea + '\n';
    }

    aumentarIndentacion() {
        this.nivelIndentacion++;
    }

    disminuirIndentacion() {
        if (this.nivelIndentacion > 0) {
            this.nivelIndentacion--;
        }
    }
}