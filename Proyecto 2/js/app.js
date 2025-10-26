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
        const erroresLexicos = this.lexer.obtenerErrores();
        const erroresSintacticos = this.parser.obtenerErrores();
        
        const html = this.generarHTMLReporte(tokens, erroresLexicos, erroresSintacticos);
        this.guardarArchivo(html, 'html', `reporte_analisis_${Date.now()}.html`);
    }



    //GENERAR REPORTE HTML DE TOKENS Y ERRORES
    generarHTMLReporte(tokens, erroresLexicos, erroresSintacticos) {
        const fecha = new Date().toLocaleString();
        
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>JavaBridge - Reporte de Analisis</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2 { 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .info {
            background: #e8f4fc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            font-size: 14px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #3498db; 
            color: white; 
            font-weight: bold;
        }
        tr:nth-child(even) { 
            background-color: #f8f9fa; 
        }
        tr:hover {
            background-color: #e8f4fc;
        }
        .contador { 
            font-weight: bold; 
            color: #e74c3c; 
        }
        .error { 
            color: #e74c3c; 
            font-weight: bold;
        }
        .exito {
            color: #27ae60;
            font-weight: bold;
        }
        .seccion {
            margin-bottom: 40px;
        }
        .token-type {
            font-family: 'Consolas', monospace;
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JavaBridge - Reporte de Analisis</h1>
        
        <div class="info">
            <strong>Generado:</strong> ${fecha}<br>
            <strong>Tokens encontrados:</strong> <span class="contador">${tokens.length}</span><br>
            <strong>Errores lexicos:</strong> <span class="contador">${erroresLexicos.length}</span><br>
            <strong>Errores sintacticos:</strong> <span class="contador">${erroresSintacticos.length}</span>
        </div>

        <!-- SECCION DE TOKENS -->
        <div class="seccion">
            <h2>Tokens Encontrados</h2>
            ${tokens.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
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
                            <td><code>${this.escapeHTML(token.lexema)}</code></td>
                            <td><span class="token-type">${token.tipo}</span></td>
                            <td>${token.linea}</td>
                            <td>${token.columna}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p class="exito">No se encontraron tokens.</p>'}
        </div>

        <!-- SECCION DE ERRORES LEXICOS -->
        <div class="seccion">
            <h2>Errores Lexicos</h2>
            ${erroresLexicos.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Error</th>
                        <th>Descripcion</th>
                        <th>Linea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
                    ${erroresLexicos.map((error, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="error"><code>${this.escapeHTML(error.mensaje.split(':')[0])}</code></td>
                            <td>${this.escapeHTML(error.mensaje)}</td>
                            <td>${error.linea}</td>
                            <td>${error.columna}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p class="exito">No se encontraron errores lexicos</p>'}
        </div>

        <!-- SECCION DE ERRORES SINTACTICOS -->
        <div class="seccion">
            <h2>Errores Sintacticos</h2>
            ${erroresSintacticos.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Error</th>
                        <th>Descripcion</th>
                        <th>Linea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
                    ${erroresSintacticos.map((error, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="error"><code>${this.escapeHTML(error.mensaje.split(':')[0])}</code></td>
                            <td>${this.escapeHTML(error.mensaje)}</td>
                            <td>${error.linea}</td>
                            <td>${error.columna}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p class="exito">No se encontraron errores sintacticos</p>'}
        </div>

        <!-- RESUMEN -->
        <div class="seccion">
            <h2>Resumen del Analisis</h2>
            <div class="info">
                ${erroresLexicos.length === 0 && erroresSintacticos.length === 0 ? 
                    '<p class="exito">Analisis completado sin errores. El codigo es valido.</p>' :
                    `<p class="error">Se encontraron ${erroresLexicos.length + erroresSintacticos.length} errores que deben ser corregidos</p>`
                }
                <p><strong>Total de tokens procesados:</strong> ${tokens.length}</p>
                <p><strong>Estado:</strong> ${erroresLexicos.length === 0 && erroresSintacticos.length === 0 ? 
                    '<span class="exito">VALIDO</span>' : 
                    '<span class="error">INVALIDO</span>'}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    traducirCodigo() {
        const codigoJava = document.getElementById('codigoJava').value;
        const areaTextoPython = document.getElementById('codigoPython');
        
        try {
            //ANALISIS LEXICO
            const tokens = this.lexer.tokenizar(codigoJava);
            const erroresLexicos = this.lexer.obtenerErrores();
            
            //ANALISIS SINTACTICO
            const ast = this.parser.parsear(tokens);
            const erroresSintacticos = this.parser.obtenerErrores();
            
            //Si hay errores, mostrar reporte
            if (erroresLexicos.length > 0 || erroresSintacticos.length > 0) {
                this.mostrarSeccionReportes();
                this.actualizarReporteErrores(erroresLexicos, erroresSintacticos);
                areaTextoPython.value = '#Error: Corrija los errores antes de traducir';
                return;
            }
            
            //TRADUCCION
            const codigoPython = this.traductor.traducir(ast);
            areaTextoPython.value = codigoPython;
            
        } catch (error) {
            console.error('Error en traduccion:', error);
            areaTextoPython.value = `#Error en traduccion\n# ${error.message}`;
        }
    }
}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});