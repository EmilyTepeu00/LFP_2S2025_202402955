//TIPOS DE TOKENS Y PALABRAS RESERVADAS
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
    COMILLAS: 'COMILLAS',
    VS: 'VS',

    CADENA: 'CADENA',
    NUMERO: 'NUMERO',
    IDENTIFICADOR: 'IDENTIFICADOR',
    EOF: 'EOF'
};

//PALABRAS RESERVADAS CON SU TIPO DE TOKEN
const PalabrasReservadas = {
    'torneo': TipoToken.TORNEO,
    'equipos': TipoToken.EQUIPOS,
    'eliminacion': TipoToken.ELIMINACION,
    'equipo': TipoToken.EQUIPO,
    'jugador': TipoToken.JUGADOR,
    'partido': TipoToken.PARTIDO,
    'goleador': TipoToken.GOL,
    'resultado': TipoToken.RESULTADO,
    'nombre': TipoToken.NOMBRE,
    'sede': TipoToken.SEDE,
    'posicion': TipoToken.POSICION,
    'numero': TipoToken.NUMERO,
    'edad': TipoToken.EDAD,
    'minuto': TipoToken.MINUTO,
    'vs': TipoToken.VS,
    'portero': TipoToken.PORTERO,
    'defensa': TipoToken.DEFENSA,
    'mediocampo': TipoToken.MEDIOCAMPO,
    'delantero': TipoToken.DELANTERO,
};

//-----CLASES PARA TOKENS Y ERRORES-----

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
                `Caracter '${caracter}' no reconocido en el lenguaje.`,
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

    //---FUNCIONES AUXILIARES PARA EL AFD---

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
        return this.esLetra(caracter) || this.esDigito(caracter) || caracter === '_';
    }

    //LECTURA DE TOKENS ESPECIFICOS
    verificarSimbolosUnCaracter(caracter) {
        const lineaInicial = this.linea;
        const columnaInicial = this.columna;

        let tipoDeToken = null;
        switch (caracter) {
            case '{': tipoDeToken = TipoToken.LLAVE_IZQ; break;
            case '}': tipoDeToken = TipoToken.LLAVE_DER; break;
            case '[': tipoDeToken = TipoToken.CORCHETE_IZQ; break;
            case ']': tipoDeToken = TipoToken.CORCHETE_DER; break;
            case ':': tipoDeToken = TipoToken.DOS_PUNTOS; break;
            case ',': tipoDeToken = TipoToken.COMA; break;
            case '(': 
            case ')': 
            default: 
                return null;
        }

        return new Token(tipoDeToken, caracter, lineaInicial, columnaInicial);
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

//MANEJO DE LA INTERFAZ DE USUARIO
let resultadosAnalisisActual = null;
let torneoActual = null;

function cargarArchivo() {
    const entradaArchivo = document.getElementById('fileInput');
    const archivo = entradaArchivo.files[0];

    if (archivo) {
        const lector = new FileReader();
        lector.onload = function(e) {
            const contenido = e.target.result;
            document.getElementById('codeInput').value = contenido;
        };
        lector.readAsText(archivo);

    } else {
        alert('Debe seleccionar un archivo primero');
    }
}

function analizarTexto() {
    const entradaCodigo = document.getElementById('codeInput');
    const codigoFuente = entradaCodigo.value;

    if (!codigoFuente.trim()) {
        alert('El area del texto esta vacia. Cargue o escriba el codigo');
        return;
    }

    //ANALISIS LEXICO
    const analizador = new AnalizadorLexico(codigoFuente);
    const resultadosLexico = analizador.analizar();

    mostrarResultados(resultadosLexico);

    //Intentar el analisis sintactico, incluso con errores lexicos
    try {
        const parser = new Parser(resultadosLexico.tokens);
        const resultadosSintactico = parser.analizar();

        if (resultadosSintactico.exito) {
            console.log("✅ Analisis sintactico EXITOSO", resultadosSintactico.torneo);
            torneoActual = resultadosSintactico.torneo;
        } else {
            console.log("❌ Analisis sintactico FALLIDO", resultadosSintactico.errores);
            mostrarErroresSintacticos(resultadosSintactico.errores);
            //Intentar crear un torneo basico para reportes
            torneoActual = new Torneo("Torneo con Errores", 0, "");
        }
        
        //Mostrar el boton de generar reportes
        document.getElementById('btnGenerarReportes').style.display = 'block';

    } catch (error) {
        console.error("Error en analisis sintactico:", error);
        torneoActual = new Torneo("Torneo con Errores", 0, "");
        document.getElementById('btnGenerarReportes').style.display = 'block';
    }

    document.getElementById('results-section').style.display = 'block';
}


function mostrarErroresSintacticos(errores) {
    const cuerpoTablaErrores = document.querySelector('#errors-table tbody');
    cuerpoTablaErrores.innerHTML = '';

    if (errores.length === 0) {
        cuerpoTablaErrores.innerHTML = '<tr><td colspan="6">No se encontraron errores sintacticos</td></tr>';
        return;
    }

    errores.forEach((error, indice) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${escaparHtml(error.lexema || '')}</td>
            <td>${escaparHtml(error.tipo || 'Error Sintactico')}</td>
            <td>${escaparHtml(error.descripcion || 'Error desconocido')}</td>
            <td>${error.linea || 'N/A'}</td>
            <td>${error.columna || 'N/A'}</td>
        `;
        cuerpoTablaErrores.appendChild(fila);
    });
}


function mostrarResultados(resultado) {
    mostrarTokens(resultado.tokens);
    mostrarErrores(resultado.errores);
}

function mostrarTokens(tokens) {
    const cuerpoTablaTokens = document.querySelector('#tokens-table tbody');
    cuerpoTablaTokens.innerHTML = '';

    tokens.forEach((token, indice) => {
        if (token.tipo === TipoToken.EOF) return;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${escaparHtml(token.valor)}</td>
            <td>${token.tipo}</td>
            <td>${token.linea}</td>
            <td>${token.columna}</td>
        `;
        cuerpoTablaTokens.appendChild(fila);
    });
}

function mostrarErrores(errores) {
    const cuerpoTablaErrores = document.querySelector('#errors-table tbody');
    cuerpoTablaErrores.innerHTML = '';

    if (errores.length === 0) {
        cuerpoTablaErrores.innerHTML = '<tr><td colspan="6">No se encontraron errores lexicos</td></tr>';
        return;
    }

    errores.forEach((error, indice) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${indice + 1}</td>
            <td>${escaparHtml(error.lexema)}</td>
            <td>${error.tipoError}</td>
            <td>${error.descripcion}</td>
            <td>${error.linea}</td>
            <td>${error.columna}</td>
        `;
        cuerpoTablaErrores.appendChild(fila);
    });
}

function escaparHtml(texto) {
    if (typeof texto !== 'string') return texto;
    
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];
        switch (caracter) {
            case '&': resultado += '&amp;'; break;
            case '<': resultado += '&lt;'; break;
            case '>': resultado += '&gt;'; break;
            case '"': resultado += '&quot;'; break;
            case "'": resultado += '&#039;'; break;
            default: resultado += caracter;
        }
    }
    return resultado;
}

//GENERACION DE REPORTES
function generarReportes() {
    if (!torneoActual) {
        torneoActual = new Torneo("Torneo con Errores", 0, "");
    }

    console.log("📊 Generando reportes para:", torneoActual);
    
    const generador = new GeneradorReportes(torneoActual);
    const reportes = generador.generarTodosReportes();
    
    console.log("📊 HTML de reportes:", reportes);
    
    const reportesContainer = document.getElementById('reportes-container');
    reportesContainer.innerHTML = `
        <h2>📊 Reportes Generados</h2>
        <div class="advertencia">
            <strong>Nota:</strong> Algunos datos pueden estar incompletos debido a errores en el archivo
        </div>
        ${reportes.general || '<p>No hay reporte general</p>'}
        ${reportes.estadisticas || '<p>No hay reporte de estadisticas</p>'}
        ${reportes.goleadores || '<p>No hay reporte de goleadores</p>'}
        ${reportes.bracket || '<p>No hay reporte de bracket</p>'}
    `;
    
    reportesContainer.style.display = 'block';
    
    //Mostrar boton para bracket Graphviz
    document.getElementById('btnMostrarBracket').style.display = 'inline-block';
    
    //Ocultar contenedor de bracket Graphviz inicialmente
    document.getElementById('bracket-container').style.display = 'none';

    mostrarNotificacion('✅ Reportes generados con exito');
}

function mostrarNotificacion(mensaje) {
    //Elemento de notificacion
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        animation: slideIn 0.3s ease-out;
    `;
    notificacion.textContent = mensaje;

    //Animacion CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    //Añadir al programa
    document.body.appendChild(notificacion);

    //Auto-eliminar despues de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

//FUNCION PARA LIMPIAR TODO
function limpiarTodo() {
    //Limpiar campos de entrada
    document.getElementById('fileInput').value = '';
    document.getElementById('codeInput').value = '';
    
    //Limpiar resultados
    document.querySelector('#tokens-table tbody').innerHTML = '';
    document.querySelector('#errors-table tbody').innerHTML = '';
    document.getElementById('reportes-container').innerHTML = '';
    document.getElementById('bracket-container').innerHTML = '';
    document.getElementById('bracket-container').style.display = 'none';
    
    //Ocultar secciones
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('btnGenerarReportes').style.display = 'none';
    document.getElementById('btnMostrarBracket').style.display = 'none';
    
    //Resetear variables
    resultadosAnalisisActual = null;
    torneoActual = null;
    
    mostrarNotificacion('🗑️ Datos limpiados correctamente');
}

//FUNCION PARA MOSTRAR BRACKET GRAPHVIZ
function mostrarBracket() {
    if (!torneoActual) {
        mostrarNotificacion('❌ No hay datos de torneo para generar el bracket');
        return;
    }
    
    const generador = new GeneradorReportes(torneoActual);
    const graphvizCode = generador.generarGraphviz();
    
    const bracketContainer = document.getElementById('bracket-container');
    bracketContainer.innerHTML = graphvizCode;
    bracketContainer.style.display = 'block';
    
    //Scroll al bracket
    bracketContainer.scrollIntoView({ behavior: 'smooth' });
    
    mostrarNotificacion('📊 Bracket Graphviz generado');
}