class AppJavaBridge {
    constructor() {
        this.inicializarApp();
    }

    inicializarApp() {
        console.log('Inicializando aplicación...');
        this.lexer = new Lexer();
        this.parser = new Parser();
        this.traductor = new Traductor();
    
        this.crearMenuArchivo();
        this.crearSeccionReportes();
        this.configurarEventos();
    
        console.log('Aplicación inicializada correctamente');
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
            <button id="simularEjecucionBtn">Simular Ejecución</button>
            <button id="acercaDeBtn">Acerca De</button>
            <button id="salirBtn">Salir</button>
        `;
    
        controls.parentNode.insertBefore(menuArchivo, controls);
        this.configurarMenuArchivo();
    }

    crearSeccionReportes() {
        console.log('Creando seccion de reportes...');
    
        const container = document.querySelector('.container');
    
        if (!container) {
            console.error('No se encontró el contenedor principal');
            return;
        }
    
        //Verificar si ya existe
        let seccionReportes = document.getElementById('seccionReportes');
        if (seccionReportes) {
            console.log('La seccion de reportes ya existe');
            return seccionReportes;
        }
    
        try {
            seccionReportes = document.createElement('div');
            seccionReportes.id = 'seccionReportes';
            seccionReportes.className = 'reportes-section';
            seccionReportes.style.display = 'none';
            seccionReportes.innerHTML = `
                <div class="reportes-header">
                    <h2>Reportes de Análisis</h2>
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
                            <button class="pestaña activa" data-pestaña="lexicos">Léxicos</button>
                            <button class="pestaña" data-pestaña="sintacticos">Sintácticos</button>
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
            console.log('seccion de reportes creada correctamente');
            return seccionReportes;
        
        } catch (error) {
            console.error('Error al crear seccion de reportes:', error);
            return null;
        }
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
    
        document.getElementById('simularEjecucionBtn').addEventListener('click', () => {
            this.simularEjecucion();
        });
    
        document.getElementById('acercaDeBtn').addEventListener('click', () => {
            this.mostrarAcercaDe();
        });
    
        document.getElementById('salirBtn').addEventListener('click', () => {
            this.salirAplicacion();
        });
    }

    salirAplicacion() {
        if (confirm('¿Cerrar completamente JavaBridge?')) {
            document.body.innerHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>JavaBridge - Cerrado</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0; 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: white;
                        }
                        .container { 
                            text-align: center; 
                            background: rgba(255,255,255,0.1);
                            padding: 40px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                        }
                        h1 { 
                            font-size: 2.5em; 
                            margin-bottom: 20px;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        }
                        p { 
                            font-size: 1.2em; 
                            margin-bottom: 30px;
                            opacity: 0.9;
                        }
                        button { 
                            padding: 15px 30px; 
                            background: #e74c3c; 
                            color: white; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-size: 1.1em;
                            transition: all 0.3s ease;
                        }
                        button:hover { 
                            background: #c0392b; 
                            transform: translateY(-2px);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>JavaBridge - Cerrado</h1>
                        <p>La aplicación de traducción Java a Python ha sido finalizada</p>
                        <button onclick="window.location.reload()">Volver a Abrir</button>
                    </div>
                </body>
                </html>
            `;
        }
    }

    simularEjecucion() {
        const codigoPython = document.getElementById('codigoPython').value;
    
        if (!codigoPython.trim()) {
            alert('No hay código Python para simular');
            return;
        }
    
        //Crear seccion de simulación
        this.crearSeccionSimulacion();
    
        //Simulación basica - mostrar codigo ejecutandose
        const simulacionContent = document.getElementById('simulacionContent');
        simulacionContent.innerHTML = `
            <h3>Simulación de Ejecución Python</h3>
            <div class="consola-simulacion">
                <pre id="salidaSimulacion"></pre>
            </div>
            <button id="ejecutarPasoBtn">Ejecutar Paso a Paso</button>
            <button id="ejecutarTodoBtn">Ejecutar Todo</button>
        `;
    
        this.mostrarSeccionSimulacion();
    
        //Configurar botones de simulacion
        document.getElementById('ejecutarTodoBtn').addEventListener('click', () => {
            this.ejecutarTodoPython(codigoPython);
        });
    }

    crearSeccionSimulacion() {
        const container = document.querySelector('.container');
    
        //Verificar si ya existe
        if (document.getElementById('seccionSimulacion')) {
            return;
        }
    
        const seccionSimulacion = document.createElement('div');
        seccionSimulacion.id = 'seccionSimulacion';
        seccionSimulacion.className = 'simulacion-section';
        seccionSimulacion.style.display = 'none';
        seccionSimulacion.innerHTML = `
            <div class="simulacion-header">
                <h2>Simulación de Ejecución</h2>
                <button id="cerrarSimulacionBtn">Cerrar</button>
            </div>
            <div class="simulacion-contenido" id="simulacionContent">
                <!-- Aquí se cargará la simulación -->
            </div>
        `;
    
        container.appendChild(seccionSimulacion);
    
        //Configurar evento cerrar
        document.getElementById('cerrarSimulacionBtn').addEventListener('click', () => {
            this.ocultarSimulacion();
        });
    }

    mostrarSeccionSimulacion() {
        document.getElementById('seccionSimulacion').style.display = 'block';
        document.getElementById('seccionSimulacion').scrollIntoView({ behavior: 'smooth' });
    }

    ocultarSimulacion() {
        document.getElementById('seccionSimulacion').style.display = 'none';
    }
    
    ejecutarTodoPython(codigoPython) {
        const salida = document.getElementById('salidaSimulacion');
        salida.innerHTML = '';
    
        const lineas = codigoPython.split('\n');
        let output = '';
    
        lineas.forEach((linea, index) => {
            if (linea.trim() && !linea.trim().startsWith('#')) {
                output += `[Línea ${index + 1}] ${linea}\n`;
            
                //Simular salida de prints
                if (linea.trim().startsWith('print(')) {
                    const contenido = linea.match(/print\((.*)\)/);
                    if (contenido) {
                        //Evaluar expresion basica
                        let resultado = contenido[1];
                        resultado = resultado.replace(/str\(/g, '').replace(/\)/g, '');
                        output += `>>> ${resultado}\n`;
                    }
                }
            }
        });
    
        salida.textContent = output;
    }

    mostrarAcercaDe() {
        const acercaDeHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2>JavaBridge - Traductor Java a Python</h2>
                <p><strong>Desarrollado por:</strong> Emily Maritza Tepeu Guacamaya</p>
                <p><strong>Carnet:</strong> 202402955</p>
                <p><strong>Curso:</strong> Lenguajes Formales y de Programación</p>
                <p><strong>Proyecto 2</strong></p>
                <p>Universidad San Carlos de Guatemala</p>
                <p>Facultad de Ingeniería</p>
                <hr>
                <p>Esta aplicación traduce un subconjunto de Java a Python, incluyendo:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Declaraciones de variables</li>
                    <li>Estructuras de control (if, for, while)</li>
                    <li>Operaciones matemáticas</li>
                    <li>Impresión en pantalla</li>
                    <li>Conversión automática de tipos</li>
                </ul>
            </div>
        `;
    
        // Usar SweetAlert o alert nativo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Acerca de JavaBridge',
                html: acercaDeHTML,
                width: 600,
                confirmButtonText: 'Cerrar'
            });
        } else {
            alert('JavaBridge - Traductor Java a Python\nDesarrollado por: Emily Maritza tepeu Guacamaya\nCarnet: 202402955');
        }
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
        console.log('Actualizando reporte de errores...');
    
        console.log('=== ERRORES LÉXICOS ===', erroresLexicos);
        console.log('=== ERRORES SINTÁCTICOS ===', erroresSintacticos);
    
        const areaPython = document.getElementById('codigoPython');
        if (areaPython) {
            let mensaje = '# SE DETECTARON ERRORES:\n';
            if (erroresLexicos.length > 0) {
                mensaje += '# Errores léxicos: ' + erroresLexicos.length + '\n';
                erroresLexicos.forEach(error => {
                    mensaje += `# - ${error.mensaje} (Línea ${error.linea})\n`;
                });
            }
            if (erroresSintacticos.length > 0) {
                mensaje += '# Errores sintácticos: ' + erroresSintacticos.length + '\n';
                erroresSintacticos.forEach(error => {
                    mensaje += `# - ${error.mensaje} (Línea ${error.linea})\n`;
                });
            }
            mensaje += '\n';
            areaPython.value = mensaje + areaPython.value;
        }
    }

    actualizarReporteAST(ast) {
        const astJson = document.getElementById('astJson');
        
        if (ast) {
            astJson.textContent = JSON.stringify(ast, null, 2);
        } else {
            astJson.textContent = 'No se pudo generar el AST debido a errores sintacticos';
        }
        
        //Mostrar seccion AST y ocultar otras
        document.getElementById('reporteTokens').style.display = 'none';
        document.getElementById('reporteErrores').style.display = 'none';
        document.getElementById('reporteAST').style.display = 'block';
    }



    mostrarSeccionReportes() {
        try {
            let seccionReportes = document.getElementById('seccionReportes');
        
            //Si no existe, crearla
            if (!seccionReportes) {
                console.log('Creando seccion de reportes...');
                this.crearSeccionReportes();
                seccionReportes = document.getElementById('seccionReportes');
            }
            
            if (seccionReportes) {
                seccionReportes.style.display = 'block';
                seccionReportes.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('No se pudo crear la seccion de reportes');
            }
        } catch (error) {
            console.error('Error al mostrar seccion de reportes:', error);
        }
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
        try {
            const tokens = this.lexer.obtenerTokens();
            const erroresLexicos = this.lexer.obtenerErrores();
            const erroresSintacticos = this.parser.obtenerErrores();
        
            const html = this.generarHTMLReporte(tokens, erroresLexicos, erroresSintacticos);
            this.guardarArchivo(html, 'html', `reporte_analisis_${Date.now()}.html`);
        
            // Mostrar confirmación
            if (typeof Swal !== 'undefined') {
                Swal.fire('Éxito', 'Reporte HTML descargado correctamente', 'success');
            } else {
                alert('Reporte HTML descargado correctamente');
            }
        } catch (error) {
            console.error('Error al descargar HTML:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo descargar el reporte HTML', 'error');
            } else {
                alert('Error al descargar el reporte HTML');
            }
        }
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
        console.log('=== INICIANDO TRADUCCIÓN ===');
        
        //ANALISIS LEXICO
        const tokens = this.lexer.tokenizar(codigoJava);
        const erroresLexicos = this.lexer.obtenerErrores();
        
        //ANALISIS SINTACTICO
        let ast = null;
        let erroresSintacticos = [];
        
        try {
            ast = this.parser.parsear(tokens);
            erroresSintacticos = this.parser.obtenerErrores();
        } catch (error) {
            console.error('Error en parser:', error);
            erroresSintacticos = [{ mensaje: error.message, linea: 1, columna: 1 }];
        }
        
        //TRADUCCION (SIEMPRE intentar)
        let codigoPython = '';
        
        if (ast) {
            try {
                codigoPython = this.traductor.traducir(ast);
            } catch (error) {
                console.error('Error en traductor:', error);
                codigoPython = `# Error en traducción: ${error.message}\n`;
            }
        } else {
            codigoPython = '# No se pudo generar AST debido a errores\n';
        }
        
        //AGREGAR ENCABEZADO CON ERRORES
        if (erroresLexicos.length > 0 || erroresSintacticos.length > 0) {
            let header = '# TRADUCCION CON ERRORES\n';
            header += '# ======================\n';
            
            if (erroresLexicos.length > 0) {
                header += `# Errores léxicos: ${erroresLexicos.length}\n`;
            }
            
            if (erroresSintacticos.length > 0) {
                header += `# Errores sintácticos: ${erroresSintacticos.length}\n`;
            }
            
            header += '# ======================\n\n';
            codigoPython = header + codigoPython;
        }
        
        //SIEMPRE mostrar el código Python
        areaTextoPython.value = codigoPython;
        
        //SOLO intentar mostrar reportes si no hay errores criticos
        try {
            if (erroresLexicos.length > 0 || erroresSintacticos.length > 0) {
                this.actualizarReporteErrores(erroresLexicos, erroresSintacticos);
            }
        } catch (error) {
            console.log('No se pudieron mostrar los reportes, pero la traducción está completa');
        }
        
    } catch (error) {
        console.error('Error general en traducción:', error);
        areaTextoPython.value = `# Error crítico\n# ${error.message}`;
    }
}

    //Traducción directa desde tokens (fallback)
    traducirDesdeTokens(tokens) {
        console.log('Ejecutando traducción desde tokens...');
    
        let codigoPython = '# Traducción básica desde tokens\\n';
        codigoPython += '# (Se detectaron errores en el análisis)\\n\\n';
    
        //Filtrar solo tokens relevantes (sin comentarios, espacios, etc.)
        const tokensFiltrados = tokens.filter(token => 
            !['COMENTARIO_LINEA', 'COMENTARIO_BLOQUE'].includes(token.tipo)
        );
    
        let enMain = false;
        let indentacion = 0;
    
        for (let i = 0; i < tokensFiltrados.length; i++) {
            const token = tokensFiltrados[i];
        
            //Detectar cuando estamos dentro del main
            if (token.tipo === 'PALABRA_RESERVADA' && token.lexema === 'main') {
                enMain = true;
                continue;
            }
        
            if (enMain) {
                //Logica básica de traduccion
                switch (token.tipo) {
                    case 'PALABRA_RESERVADA':
                        if (token.lexema === 'int' || token.lexema === 'double' || 
                            token.lexema === 'String' || token.lexema === 'boolean') {
                            //Declaracion - buscar identificador y valor
                            const nextToken = tokensFiltrados[i + 1];
                            if (nextToken && nextToken.tipo === 'IDENTIFICADOR') {
                                let linea = '    '.repeat(indentacion) + nextToken.lexema + ' = ';
                            
                                //Buscar asignacion
                                if (tokensFiltrados[i + 2] && tokensFiltrados[i + 2].lexema === '=') {
                                    //Construir expresion
                                    let j = i + 3;
                                    let expresion = '';
                                    while (j < tokensFiltrados.length && tokensFiltrados[j].lexema !== ';') {
                                        expresion += tokensFiltrados[j].lexema + ' ';
                                        j++;
                                    }
                                    linea += expresion.trim();
                                    i = j;
                                } else {
                                    //Valor por defecto
                                    const valoresDefecto = {
                                        'int': '0',
                                        'double': '0.0',
                                        'String': '""',
                                        'boolean': 'False'
                                    };
                                    linea += valoresDefecto[token.lexema] || 'None';
                                    i += 1;
                                }
                            
                                codigoPython += linea + '\\n';
                            }
                        }
                        break;
                    
                    case 'SIMBOLO':
                        if (token.lexema === '{') indentacion++;
                        if (token.lexema === '}') indentacion--;
                        break;
                }
            }
        }
    
        return codigoPython;
    }

    mostrarErroresEnConsola(erroresLexicos, erroresSintacticos) {
        console.log('=== ERRORES LÉXICOS DETECTADOS ===');
        if (erroresLexicos.length === 0) {
            console.log('No hay errores léxicos');
        } else {
            erroresLexicos.forEach((error, index) => {
                console.log(`Error ${index + 1}: ${error.mensaje} en línea ${error.linea}, columna ${error.columna}`);
            });
        }
    
        console.log('=== ERRORES SINTÁCTICOS DETECTADOS ===');
        if (erroresSintacticos.length === 0) {
            console.log('No hay errores sintácticos');
        } else {
            erroresSintacticos.forEach((error, index) => {
                console.log(`Error ${index + 1}: ${error.mensaje} en línea ${error.linea}, columna ${error.columna}`);
            });
        }
    }

}

//INICIALIZAR CUANDO EL DOM ESTE LISTO
document.addEventListener('DOMContentLoaded', () => {
    new AppJavaBridge();
});