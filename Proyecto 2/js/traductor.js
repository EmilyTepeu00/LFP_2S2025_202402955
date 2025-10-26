class Traductor {
    constructor() {
        this.codigoPython = '';
        this.nivelIndentacion = 0;
        this.variablesDeclaradas = new Set();
    }

    traducir(ast) {
        this.codigoPython = '';
        this.nivelIndentacion = 0;
        this.variablesDeclaradas.clear();

        if (!ast) {
            return '# Error: No se pudo generar el AST\n';
        }

        this.agregarLinea('# Traducido de Java a Python');
        this.agregarLinea('');

        this.traducirPrograma(ast);

        return this.codigoPython;
    }

    traducirPrograma(programa) {
        this.agregarLinea(`# Clase: ${programa.nombreClase}`);
        this.agregarLinea('');
        this.traducirMain(programa.main);
    }

    traducirMain(main) {
        //Ejecutar directamente
        this.traducirSentencias(main.sentencias);
    }

    traducirSentencias(sentencias) {
        for (const sentencia of sentencias) {
            this.traducirSentencia(sentencia);
        }
    }

    traducirSentencia(sentencia) {
        switch (sentencia.tipo) {
            case 'DECLARACION':
                this.traducirDeclaracion(sentencia);
                break;
            case 'ASIGNACION':
                this.traducirAsignacion(sentencia);
                break;
            case 'SENTENCIA_VACIA':
                //No hacer nada para punto y coma vacio
                break;
            default:
                this.agregarLinea(`# Sentencia no traducida: ${sentencia.tipo}`);
        }
    }

    traducirDeclaracion(declaracion) {
        for (const variable of declaracion.variables) {
            const nombreVar = variable.nombre;
            this.variablesDeclaradas.add(nombreVar);
            
            let valorPython = this.obtenerValorPorDefecto(declaracion.tipoDato);
            
            if (variable.valorInicial) {
                valorPython = this.traducirExpresion(variable.valorInicial);
            }
            
            const comentario = `# Declaracion: ${declaracion.tipoDato}`;
            this.agregarLinea(`${nombreVar} = ${valorPython} ${comentario}`);
        }
    }

    traducirAsignacion(asignacion) {
        const valorPython = this.traducirExpresion(asignacion.expresion);
        this.agregarLinea(`${asignacion.variable} = ${valorPython}`);
    }

    traducirExpresion(expresion) {
        switch (expresion.tipo) {
            case 'VARIABLE':
                return expresion.nombre;
            case 'LITERAL':
                return this.traducirLiteral(expresion);
            case 'EXPRESION_BINARIA':
                return this.traducirExpresionBinaria(expresion);
            default:
                return `# Expresion no traducida: ${expresion.tipo}`;
        }
    }

    traducirLiteral(literal) {
        switch (literal.subtipo) {
            case 'ENTERO':
            case 'DECIMAL':
                return literal.valor;
            case 'CARACTER':
                //Los caracteres son strings de un solo caracter
                return `'${literal.valor.replace(/'/g, "\\'")}'`;
            case 'CADENA':
                return `"${literal.valor.replace(/"/g, '\\"')}"`;
            case 'BOOLEANO':
                return literal.valor === 'true' ? 'True' : 'False';
            default:
                return literal.valor;
        }
    }

    traducirExpresionBinaria(expresion) {
        const izquierdo = this.traducirExpresion(expresion.izquierdo);
        const derecho = this.traducirExpresion(expresion.derecho);
        
        //Para suma con strings convertir automaticamente
        if (expresion.operador === '+' && 
            (this.esNumero(expresion.izquierdo) || this.esNumero(expresion.derecho))) {
            return `str(${izquierdo}) + str(${derecho})`;
        }
        
        return `(${izquierdo} ${expresion.operador} ${derecho})`;
    }

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

    esNumero(expresion) {
        return expresion.tipo === 'LITERAL' && 
               (expresion.subtipo === 'ENTERO' || expresion.subtipo === 'DECIMAL');
    }

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