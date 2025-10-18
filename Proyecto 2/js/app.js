class JavaBridgeApp {
    constructor() {
        this.inicializarApp();
    }

    inicializarApp() {
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.tradcutor = new Traductor();
        this.configurarEventos();
        this.crearMenuArchivo();
    }

    configurarEventos() {
        const traducirBtn = document.getElementById('traducirBtn');
        if (traducirBtn) {
            traducirBtn.addEventListener('click', () => {
                this.traducirCodigo();
            });
        }
    }

    crearMenuArchivo() {
        //Crear elementos del menu de archivo
        const controls = document.querySelector('.controls');

        const menuArchivo = document.createElement('div');
        menuArchivo.className = 'menu-archivo';
        menuArchivo.innerHTML = `
            <button id="nuevoBtn">Nuevo</button>
            <button id="abrirBtn">Abrir .java</button>
            <button id="guardarJavaBtn">Guardar .java</button>
            <button id="guardarPythonBtn">Guardar .py</button>
        `;

        controls.parentNode.insertBefore(menuArchivo, controls);

        //Configurar eventos del menu
        this.configurarMenuArchivo();
    }

    configurarMenuArchivo() {
        document.getElementById('nuevoBtn').addEventListener('click', () => {
            this.nuevoArchivo();
        });
        
        document.getElementById('abrirBtn').addEventListener('click', () => {
            this.abrirArchivo();
        });
        
        document.getElementById('guardarJavaBtn').addEventListener('click', () => {
            this.guardarArchivoJava();
        });
        
        document.getElementById('guardarPythonBtn').addEventListener('click', () => {
            this.guardarArchivoPython();
        });
    }

    nuevoArchivo() {
        document.getElementById('codigoJava').value = '';
        document.getElementById('codigoPython').value = '';
        console.log('Nuevo archivo creado');
    }

    abrirArchivo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.java';
        
        input.onchange = e => {
            const archivo = e.target.files[0];
            if (archivo) {
                const lector = new FileReader();
                lector.onload = event => {
                    document.getElementById('codigoJava').value = event.target.result;
                };
                lector.readAsText(archivo);
            }
        };
        
        input.click();
    }

    guardarArchivoJava() {
        this.guardarArchivo(document.getElementById('codigoJava').value, 'java', 'MiPrograma.java');
    }

    guardarArchivoPython() {
        const codigoPython = document.getElementById('codigoPython').value;
        if (!codigoPython.trim()) {
            alert('No hay código Python para guardar');
            return;
        }
        this.guardarArchivo(codigoPython, 'python', 'programa_traducido.py');
    }

    guardarArchivo(contenido, tipo, nombreDefault) {
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreDefault;
        enlace.style.display = 'none';
        
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        
        URL.revokeObjectURL(url);
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
            console.error('Error en traduccion:', error);
            areaTextoPython.value = `# Error en traduccion\n# ${error.message}`;
        }
    }
}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});