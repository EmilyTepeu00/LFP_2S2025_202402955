class Traductor {
    constructor() {
        this.codigoPython = '';
        this.nivelIndentacion = 0;
    }

    traducir(ast) {
        console.log("Iniciando traduccion Java -> Python...");
        this.codigoPython = '';
        this.nivelIndentacion = 0;

        this.agregarLinea('# Traducido de Java a Python');

        return this.codigoPython;
    }

    agregarLinea(linea) {
        const indentacion = '    '.repeat(this.nivelIndentacion);
        this.codigoPython += indentacion + linea + '\n';
    }

    aumentarIdentacion() {
        this.nivelIndentacion++;
    }

    disminuirIndentacion() {
        if (this.nivelIndentacion > 0) {
            this.nivelIndentacion--;
        }
    }

    obtenerCodigoPython() {
        return this.codigoPython;
    }
}