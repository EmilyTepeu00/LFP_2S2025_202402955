class AppJavaBridge {
    constructor() {
        this.inicializarApp();
    }

    inicializarApp() {
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.traductor = new Traductor();
        this.configurarEventos();
        this.crearMenuArchivo();
        this.crearSeccionReportes();
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
            <button id="verTokensBtn">Ver Tokens</button>
            <button id="verErroresBtn">Ver Errores</button>
            <button id="verASTBtn">Ver AST</button>
        `;
        
        controls.parentNode.insertBefore(menuArchivo, controls);

        //Configurar eventos del menu
        this.configurarMenuArchivo();
    }

    crearSeccionReportes() {
        const container = document.querySelector('.container');
        
        const seccionReportes = document.createElement('div');
        seccionReportes.id = 'seccionReportes';
        seccionReportes.className = 'reportes-section';
        seccionReportes.style.display = 'none';
        seccionReportes.innerHTML = `
            <div class="reportes-header">
                <h2>Reportes de Analisis</h2>
                <button id="cerrarReportesBtn">Cerrar</button>
                <button id="descargarHTMLBtn">Descargar HTML</button>
            </div>
            <div class="reportes-contenido">
                <div id="reporteTokens" class="reporte">
                    <h3>Tokens Encontrados: <span id="contadorTokens">0</span></h3>
                    <div class="tabla-container">
                        <table id="tablaTokens">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Lexema</th>
                                    <th>Tipo</th>
                                    <th>Linea</th>
                                    <th>Columna</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div id="reporteErrores" class="reporte">
                    <h3>Errores: <span id="contadorErrores">0</span></h3>
                    <div class="pestañas">
                        <button class="pestaña activa" data-pestaña="lexicos">Lexicos</button>
                        <button class="pestaña" data-pestaña="sintacticos">Sintacticos</button>
                    </div>
                    <div class="tabla-container">
                        <table id="tablaErroresLexicos">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Error</th>
                                    <th>Descripcion</th>
                                    <th>Linea</th>
                                    <th>Columna</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <table id="tablaErroresSintacticos" style="display: none;">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Error</th>
                                    <th>Descripcion</th>
                                    <th>Linea</th>
                                    <th>Columna</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div id="reporteAST" class="reporte">
                    <h3>Arbol de Sintaxis Abstracta (AST)</h3>
                    <pre id="astJson"></pre>
                </div>
            </div>
        `;
        
        container.appendChild(seccionReportes);
        this.configurarEventosReportes();
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
        
        document.getElementById('verTokensBtn').addEventListener('click', () => {
            this.mostrarReporteTokens();
        });
        
        document.getElementById('verErroresBtn').addEventListener('click', () => {
            this.mostrarReporteErrores();
        });
        
        document.getElementById('verASTBtn').addEventListener('click', () => {
            this.mostrarReporteAST();
        });
    }

    configurarEventosReportes() {
        document.getElementById('cerrarReportesBtn').addEventListener('click', () => {
            this.ocultarReportes();
        });
        
        document.getElementById('descargarHTMLBtn').addEventListener('click', () => {
            this.descargarReporteHTML();
        });

        //Configurar pestañas de errores
        document.querySelectorAll('.pestaña').forEach(pestaña => {
            pestaña.addEventListener('click', (e) => {
                const tipo = e.target.getAttribute('data-pestaña');
                this.cambiarPestañaErrores(tipo);
            });
        });
    }

    cambiarPestañaErrores(tipo) {
        //Actualizar botones de pestañas
        document.querySelectorAll('.pestaña').forEach(p => {
            p.classList.remove('activa');
        });
        document.querySelector(`[data-pestaña="${tipo}"]`).classList.add('activa');

        //Mostrar tabla correspondiente
        if (tipo === 'lexicos') {
            document.getElementById('tablaErroresLexicos').style.display = 'table';
            document.getElementById('tablaErroresSintacticos').style.display = 'none';

        } else {
            document.getElementById('tablaErroresLexicos').style.display = 'none';
            document.getElementById('tablaErroresSintacticos').style.display = 'table';
        }
    }

    nuevoArchivo() {
        document.getElementById('codigoJava').value = '';
        document.getElementById('codigoPython').value = '';
        this.ocultarReportes();
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
            alert('No hay codigo Python para guardar');
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

    mostrarReporteTokens() {
        const codigoJava = document.getElementById('codigoJava').value;
        const tokens = this.lexer.tokenizar(codigoJava);
        
        this.mostrarSeccionReportes();
        this.actualizarReporteTokens(tokens);
    }

    mostrarReporteErrores() {
        const codigoJava = document.getElementById('codigoJava').value;
        this.lexer.tokenizar(codigoJava);
        const erroresLexicos = this.lexer.obtenerErrores();
        
        this.mostrarSeccionReportes();
        this.actualizarReporteErrores(erroresLexicos, []);
    }

    mostrarReporteAST() {
        const codigoJava = document.getElementById('codigoJava').value;
        const tokens = this.lexer.tokenizar(codigoJava);
        
        try {
            const ast = this.parser.parsear(tokens);
            this.mostrarSeccionReportes();
            this.actualizarReporteAST(ast);
        } catch (error) {
            console.error('Error al generar AST:', error);
            this.mostrarSeccionReportes();
            this.actualizarReporteAST(null);
        }
    }

    actualizarReporteErrores(erroresLexicos, erroresSintacticos) {
        const tablaLexicosBody = document.querySelector('#tablaErroresLexicos tbody');
        const tablaSintacticosBody = document.querySelector('#tablaErroresSintacticos tbody');
        const contador = document.getElementById('contadorErrores');
        
        //Limpiar tablas
        tablaLexicosBody.innerHTML = '';
        tablaSintacticosBody.innerHTML = '';
        
        //Actualizar contador
        const totalErrores = erroresLexicos.length + erroresSintacticos.length;
        contador.textContent = totalErrores;
        
        //Llenar tabla de errores lexicos
        erroresLexicos.forEach((error, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td><code>${this.escapeHTML(error.mensaje.split(':')[0])}</code></td>
                <td>${error.mensaje}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            `;
            tablaLexicosBody.appendChild(fila);
        });
        
        //Llenar tabla de errores sintacticos
        erroresSintacticos.forEach((error, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td><code>${this.escapeHTML(error.mensaje.split(':')[0])}</code></td>
                <td>${error.mensaje}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            `;
            tablaSintacticosBody.appendChild(fila);
        });
        
        //Mostrar seccion de errores y ocultar otras
        document.getElementById('reporteTokens').style.display = 'none';
        document.getElementById('reporteErrores').style.display = 'block';
        document.getElementById('reporteAST').style.display = 'none';
        
        //Mostrar pestaña lexicos por defecto
        this.cambiarPestañaErrores('lexicos');
    }

    actualizarReporteAST(ast) {
        const astJson = document.getElementById('astJson');
        
        if (ast) {
            astJson.textContent = JSON.stringify(ast, null, 2);
        } else {
            astJson.textContent = 'No se pudo generar el AST debido a errores sintacticos.';
        }
        
        //Mostrar seccion AST y ocultar otras
        document.getElementById('reporteTokens').style.display = 'none';
        document.getElementById('reporteErrores').style.display = 'none';
        document.getElementById('reporteAST').style.display = 'block';
    }



    mostrarSeccionReportes() {
        document.getElementById('seccionReportes').style.display = 'block';
        //Scroll a la seccion de reportes
        document.getElementById('seccionReportes').scrollIntoView({ behavior: 'smooth' });
    }

    ocultarReportes() {
        document.getElementById('seccionReportes').style.display = 'none';
    }

    actualizarReporteTokens(tokens) {
        const tablaBody = document.querySelector('#tablaTokens tbody');
        const contador = document.getElementById('contadorTokens');
        
        //Limpiar tabla
        tablaBody.innerHTML = '';
        
        //Actualizar contador
        contador.textContent = tokens.length;
        
        //Llenar tabla con tokens
        tokens.forEach((token, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td><code>${this.escapeHTML(token.lexema)}</code></td>
                <td>${token.tipo}</td>
                <td>${token.linea}</td>
                <td>${token.columna}</td>
            `;
            tablaBody.appendChild(fila);
        });
        
        //Mostrar seccion de tokens y ocultar errores
        document.getElementById('reporteTokens').style.display = 'block';
        document.getElementById('reporteErrores').style.display = 'none';
    }

    actualizarReporteErrores(errores) {
        const tablaBody = document.querySelector('#tablaErrores tbody');
        const contador = document.getElementById('contadorErrores');
        
        //Limpiar tabla
        tablaBody.innerHTML = '';
        
        //Actualizar contador
        contador.textContent = errores.length;
        
        //Llenar tabla con errores
        errores.forEach((error, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td><code>${this.escapeHTML(error.mensaje.split(':')[0])}</code></td>
                <td>${error.mensaje}</td>
                <td>${error.linea}</td>
                <td>${error.columna}</td>
            `;
            tablaBody.appendChild(fila);
        });
        
        //Mostrar seccion de errores y ocultar tokens
        document.getElementById('reporteTokens').style.display = 'none';
        document.getElementById('reporteErrores').style.display = 'block';
    }

     escapeHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    descargarReporteHTML() {
        const tokens = this.lexer.obtenerTokens();
        const errores = this.lexer.obtenerErrores();
        
        const html = this.generarHTMLReporte(tokens, errores);
        this.guardarArchivo(html, 'html', 'reporte_analisis.html');
    }

    generarHTMLReporte(tokens, errores) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Analisis - JavaBridge</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .contador { font-weight: bold; color: #e74c3c; }
        .error { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>JavaBridge - Reporte de Analisis Lexico</h1>
    <p>Generado: ${new Date().toLocaleString()}</p>
    
    <h2>Tokens Encontrados: <span class="contador">${tokens.length}</span></h2>
    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Lexema</th>
                <th>Tipo</th>
                <th>Linea</th>
                <th>Columna</th>
            </tr>
        </thead>
        <tbody>
            ${tokens.map((token, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><code>${token.lexema}</code></td>
                    <td>${token.tipo}</td>
                    <td>${token.linea}</td>
                    <td>${token.columna}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Errores Lexicos: <span class="contador">${errores.length}</span></h2>
    ${errores.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Error</th>
                <th>Descripcion</th>
                <th>Linea</th>
                <th>Columna</th>
            </tr>
        </thead>
        <tbody>
            ${errores.map((error, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="error"><code>${error.mensaje.split(':')[0]}</code></td>
                    <td>${error.mensaje}</td>
                    <td>${error.linea}</td>
                    <td>${error.columna}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p>No se encontraron errores lexicos</p>'}
</body>
</html>`;
    }

    traducirCodigo() {
        const codigoJava = document.getElementById('codigoJava').value;
        const areaTextoPython = document.getElementById('codigoPython');
        
        try {
            //FLUJO COMPLETO: Lexico -> Sintactico -> Traduccion
            const tokens = this.lexer.tokenizar(codigoJava);
            const ast = this.parser.parsear(tokens);
            const codigoPython = this.traductor.traducir(ast);
            
            areaTextoPython.value = codigoPython;
            
        } catch (error) {
            console.error('Error en traduccion:', error);
            
            //Mostrar errores sintacticos si hay
            const erroresSintacticos = this.parser.obtenerErrores();
            const erroresLexicos = this.lexer.obtenerErrores();
            
            if (erroresSintacticos.length > 0 || erroresLexicos.length > 0) {
                this.mostrarSeccionReportes();
                this.actualizarReporteErrores(erroresLexicos, erroresSintacticos);
            }
            
            areaTextoPython.value = `# Error en traduccion\n# ${error.message}`;
        }
    }
}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});