class JavaBridgeApp {
    constructor() {
        this.inicializarApp();
    }

    inicializarApp() {
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.tradcutor = new Traductor();
        this.configurarEventos();
    }

    configurarEventos() {
        const traducirBtn = document.getElementById('traducirBtn');
        if (traducirBtn) {
            traducirBtn.addEventListener('click', () => {
                this.traducirCodigo();
            });
        }
    }

    traducirCodigo() {
        const codigoJava = document.getElementById('codigoJava').value;
        const areaTextoPython = document.getElementById('codigoPython');

        try {
            //FLUJO COMPLETO: Lexico -> Sintactico -> Traduccion
            const tokens = this.lexer.tokenizar(codigoJava);
            const ast = this.parser.parsear(tokens);
            const codigoPython = this.translator.traducir(ast);
            
            areaTextoPython.value = codigoPython;

        } catch (error) {
            console.error('Error en traducción:', error);
            areaTextoPython.value = `# Error en traducción\n# ${error.message}`;
        }
    }
}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});