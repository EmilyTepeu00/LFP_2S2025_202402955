//ANALIZADOR SINTACTICO
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.posicion = 0;
        this.erroresSintacticos = [];
        this.torneo = null;
    }

    //METODO PARA ANALIZAR SINTACTICAMENTE
    analizar() {
        this.erroresSintacticos = [];
    
        try {
            this.torneo = this.analizarTorneo();
            return {
                exito: true,
                torneo: this.torneo,
                errores: this.erroresSintacticos
            };

        } catch (error) {
            return {
                exito: false,
                torneo: null,
                errores: this.erroresSintacticos
            };
        }
    }

    //-----FUNCIONES AUXILIARES-----

    tokenActual() {
        if (this.posicion >= this.tokens.length) {
            return { tipo: 'EOF', valor: 'EOF' };
        }
        return this.tokens[this.posicion];
    }

    avanzar() {
        if (this.posicion < this.tokens.length) {
            this.posicion++;
        }
    }

    coincidir(tipoEsperado) {
        const token = this.tokenActual();
        console.log(`🔍 Esperando: ${tipoEsperado}, Encontrado: ${token.tipo} (${token.valor})`);

        if (token.tipo === tipoEsperado) {
            this.avanzar();
            return token;

        } else {
            //Clasificacion del tipo de error
            const simbolos = [
                'LLAVE_IZQUIERDA','LLAVE_DERECHA',
                'CORCHETE_IZQUIERDA','CORCHETE_DERECHA',
                'PARENTESIS_IZQUIERDA','PARENTESIS_DERECHA',
                'DOS_PUNTOS','COMA'
            ];

            let tipoError = 'Error Sintactico';
            if (simbolos.includes(tipoEsperado)) {
                tipoError = 'Falta de simbolo esperado';

            } else if (tipoEsperado === 'CADENA' || token.tipo === 'CADENA') {
                tipoError = 'Uso incorrecto de comillas';

            } else {
                tipoError = 'Token invalido';
            }

            const errorMsg = `Se esperaba ${tipoEsperado} pero se encontró ${token.tipo} (${token.valor})`;
            const error = {
                tipo: tipoError,
                descripcion: errorMsg,
                linea: token.linea,
                columna: token.columna,
                lexema: token.valor
            };

            this.erroresSintacticos.push(error);
            console.error("❌ ERROR SINTACTICO:", error);

            this.avanzar();
            return null;
        }
    }

    esTipo(tipo) {
        return this.tokenActual().tipo === tipo;
    }

    //-----REGLAS GRAMATICALES-----

    analizarTorneo() {
        try {
            this.coincidir('PALABRA_RESERVADA_TORNEO');
        } catch (e) {
            //Si no encuentra TORNEO -> torneo vacio
            return new Torneo("", 0, "");
        }
        
        try {
            this.coincidir('LLAVE_IZQUIERDA');
        } catch (e) {
            //Continuar aunque falte llave
        }

        let nombre = '';
        let cantidadEquipos = 0;
        let sede = '';

        //Leer atributos del torneo
        let iteraciones = 0;
        const maxIteraciones = 50; //Limite de seguridad
        
        while (!this.esTipo('LLAVE_DERECHA') && !this.esTipo('EOF') && iteraciones < maxIteraciones) {
            iteraciones++;
            try {
                const token = this.tokenActual();
                
                if (token.tipo === 'ATRIBUTO_NOMBRE') {
                    this.avanzar();
                    if (this.esTipo('DOS_PUNTOS')) this.avanzar();
                    const valor = this.esTipo('CADENA') ? this.coincidir('CADENA') : null;
                    if (valor) nombre = valor.valor;
                    
                } else if (token.tipo === 'ATRIBUTO_EQUIPOS') {
                    this.avanzar();
                    if (this.esTipo('DOS_PUNTOS')) this.avanzar();
                    const valor = this.esTipo('NUMERO') ? this.coincidir('NUMERO') : null;
                    if (valor) cantidadEquipos = parseInt(valor.valor);
                    
                } else if (token.tipo === 'ATRIBUTO_SEDE') {
                    this.avanzar();
                    if (this.esTipo('DOS_PUNTOS')) this.avanzar();
                    const valor = this.esTipo('CADENA') ? this.coincidir('CADENA') : null;
                    if (valor) sede = valor.valor;
                    
                } else {
                    this.avanzar(); //Saltar tokens inesperados
                }
                
                if (this.esTipo('COMA')) {
                    this.avanzar();
                }
            } catch (e) {
                this.avanzar(); //Continuar en caso de error
            }
        }

        try {
            if (this.esTipo('LLAVE_DERECHA')) {
                this.coincidir('LLAVE_DERECHA');
            }
        } catch (e) {
            //Continuar aunque falte llave de cierre
        }

        const torneo = new Torneo(nombre, cantidadEquipos, sede);

        //Procesar EQUIPOS si existe
        if (this.esTipo('PALABRA_RESERVADA_EQUIPOS')) {
            try {
                torneo.equipos = this.analizarEquipos();
            } catch (error) {
                console.error("Error analizando equipos:", error);
            }
        }

        //Procesar ELIMINACION si existe
        if (this.esTipo('PALABRA_RESERVADA_ELIMINACION')) {
            try {
                torneo.fases = this.analizarEliminacion();
            } catch (error) {
                console.error("Error analizando eliminacion:", error);
            }
        }

        return torneo;
    }

    analizarEquipos() {
        const equipos = [];
        
        try {
            this.coincidir('PALABRA_RESERVADA_EQUIPOS');
            
            //Manejar tanto { como :
            if (this.esTipo('DOS_PUNTOS') || this.esTipo('LLAVE_IZQUIERDA')) {
                this.avanzar();
            }
            
            let iteraciones = 0;
            const maxIteraciones = 100; //Limite de seguridad
            
            while (!this.esTipo('LLAVE_DERECHA') && !this.esTipo('EOF') && iteraciones < maxIteraciones) {
                iteraciones++;
                
                if (this.esTipo('PALABRA_RESERVADA_EQUIPO')) {
                    try {
                        const equipo = this.analizarEquipo();
                        if (equipo) equipos.push(equipo);
                    } catch (error) {
                        console.error("Error analizando equipo:", error);
                        
                        //Saltar tokens hasta encontrar algo reconocible
                        while (!this.esTipo('PALABRA_RESERVADA_EQUIPO') && 
                               !this.esTipo('LLAVE_DERECHA') && 
                               !this.esTipo('EOF') &&
                               iteraciones < maxIteraciones) {
                            this.avanzar();
                            iteraciones++;
                        }
                    }
                } else {
                    this.avanzar(); //Saltar tokens inesperados
                }
            }
            
            if (this.esTipo('LLAVE_DERECHA')) {
                this.coincidir('LLAVE_DERECHA');
            }
        } catch (e) {
            console.error("Error en seccion EQUIPOS:", e);
        }
        
        return equipos;
    }

    analizarEquipo() {
        this.coincidir('PALABRA_RESERVADA_EQUIPO');
        this.coincidir('DOS_PUNTOS');
        
        const nombreEquipoToken = this.coincidir('CADENA');
        const equipo = new Equipo(nombreEquipoToken.valor);

        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA') && !this.esTipo('EOF')) {
            if (this.esTipo('PALABRA_RESERVADA_JUGADOR')) {
                try {
                    const jugador = this.analizarJugador();
                    equipo.jugadores.push(jugador);
                } catch (error) {
                    console.error("Error analizando jugador:", error);

                    //Saltar hasta proximo jugador o fin de equipo
                    while (!this.esTipo('PALABRA_RESERVADA_JUGADOR') && 
                        !this.esTipo('CORCHETE_DERECHA') && 
                        !this.esTipo('EOF')) {
                        this.avanzar();
                    }
                }

            } else {
                //Token inesperado, registrar error y avanzar
                const token = this.tokenActual();
                this.erroresSintacticos.push({
                    tipo: 'Token inesperado',
                    descripcion: `Se esperaba 'jugador' pero se encontró: ${token.tipo}`,
                    linea: token.linea,
                    columna: token.columna,
                    lexema: token.valor
                });
                this.avanzar();
            }
        
            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }

        this.coincidir('CORCHETE_DERECHA');
        return equipo;
    }

    analizarJugador() {
        this.coincidir('PALABRA_RESERVADA_JUGADOR');
        this.coincidir('DOS_PUNTOS');

        const nombreJugadorToken = this.coincidir('CADENA');
        let jugador = new Jugador(nombreJugadorToken.valor, '', 0, 0);
    
        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA') && !this.esTipo('EOF')) {
            const tokenActual = this.tokenActual();
        
            if (tokenActual.tipo === 'ATRIBUTO_POSICION') {
                this.avanzar(); //Consumir 'posicion'
                this.coincidir('DOS_PUNTOS');
                const valor = this.coincidir('CADENA');
                if (valor) {
                    const posicionesValidas = ['PORTERO', 'DEFENSA', 'MEDIOCAMPO', 'DELANTERO'];
                    if (posicionesValidas.includes(valor.valor)) {
                        jugador.posicion = valor.valor;

                    } else {
                        this.erroresSintacticos.push({
                            tipo: 'Valor invalido',
                            descripcion: `Posición '${valor.valor}' no válida`,
                            linea: valor.linea,
                            columna: valor.columna,
                            lexema: valor.valor
                        });
                    }
                }
            
            } else if (tokenActual.tipo === 'ATRIBUTO_NUMERO') {
                this.avanzar(); //Consumir 'numero'
                this.coincidir('DOS_PUNTOS');
                const valor = this.coincidir('NUMERO');
                if (valor) {
                    jugador.numero = parseInt(valor.valor);
                }
            
            } else if (tokenActual.tipo === 'ATRIBUTO_EDAD') {
                this.avanzar(); //Consumir 'edad'
                this.coincidir('DOS_PUNTOS');
                const valor = this.coincidir('NUMERO');
                if (valor) {
                    jugador.edad = parseInt(valor.valor);
                }
            
            } else {
                //Token inesperado, registrar error y avanzar
                this.erroresSintacticos.push({
                    tipo: 'Token inesperado',
                    descripcion: `Se esperaba atributo de jugador pero se encontró: ${tokenActual.tipo}`,
                    linea: tokenActual.linea,
                    columna: tokenActual.columna,
                    lexema: tokenActual.valor
                });
                this.avanzar();
            }
        
            //Verificar si hay coma para separar atributos
            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }

        this.coincidir('CORCHETE_DERECHA');
        return jugador;
    }   

    analizarEliminacion() {
        const fases = [];
    
        try {
            this.coincidir('PALABRA_RESERVADA_ELIMINACION');
            
            //ACEPTAR TANTO { COMO :
            if (this.esTipo('DOS_PUNTOS')) {
                this.avanzar(); //Consumir los dos puntos
            }
            
            this.coincidir('LLAVE_IZQUIERDA');
            
            let iteraciones = 0;
            const maxIteraciones = 50;
            
            while (!this.esTipo('LLAVE_DERECHA') && !this.esTipo('EOF') && iteraciones < maxIteraciones) {
                iteraciones++;
                
                if (this.esTipo('IDENTIFICADOR')) {
                    const nombreFaseToken = this.coincidir('IDENTIFICADOR');
                    if (nombreFaseToken) {
                        const fase = new Fase(nombreFaseToken.valor);
                        this.coincidir('DOS_PUNTOS');
                        this.coincidir('CORCHETE_IZQUIERDA');
                        
                        //Analizar partidos dentro de la fase
                        let partidosIteraciones = 0;
                        const maxPartidosIteraciones = 20;
                        
                        while (!this.esTipo('CORCHETE_DERECHA') && !this.esTipo('EOF') && partidosIteraciones < maxPartidosIteraciones) {
                            partidosIteraciones++;
                            
                            if (this.esTipo('PALABRA_RESERVADA_PARTIDO')) {
                                try {
                                    const partido = this.analizarPartido();
                                    if (partido) fase.partidos.push(partido);
                                } catch (error) {
                                    console.error("Error analizando partido:", error);
                                    //Saltar hasta proximo partido o fin de fase
                                    while (!this.esTipo('PALABRA_RESERVADA_PARTIDO') && 
                                           !this.esTipo('CORCHETE_DERECHA') && 
                                           !this.esTipo('EOF') &&
                                           partidosIteraciones < maxPartidosIteraciones) {
                                        this.avanzar();
                                        partidosIteraciones++;
                                    }
                                }
                            } else {
                                this.avanzar();
                            }
                            
                            if (this.esTipo('COMA')) {
                                this.avanzar();
                            }
                        }
                        
                        this.coincidir('CORCHETE_DERECHA');
                        fases.push(fase);
                    }
                } else {
                    this.avanzar();
                }
                
                if (this.esTipo('COMA')) {
                    this.avanzar();
                }
            }
            
            this.coincidir('LLAVE_DERECHA');
        } catch (e) {
            console.error("Error en eliminacion:", e);
        }
        
        return fases;
    }

    analizarPartido() {
        this.coincidir('PALABRA_RESERVADA_PARTIDO');
        this.coincidir('DOS_PUNTOS');
    
        const equipoLocalToken = this.coincidir('CADENA');
        this.coincidir('VS');
        const equipoVisitanteToken = this.coincidir('CADENA');
    
        //En caso de que no se obtuvo nombre de equipos --> "N/A" para evitar crash
        const partido = new Partido(
            equipoLocalToken ? equipoLocalToken.valor : "N/A",
            equipoVisitanteToken ? equipoVisitanteToken.valor : "N/A"
        );
    
        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA') && !this.esTipo('EOF')) {
            if (this.esTipo('PALABRA_RESERVADA_RESULTADO')) {
                this.coincidir('PALABRA_RESERVADA_RESULTADO');
                this.coincidir('DOS_PUNTOS');
                const resultadoToken = this.coincidir('CADENA');

                if (resultadoToken) {
                    partido.resultado = resultadoToken.valor;

                    //Validación del formato: "X-Y"
                    if (partido.resultado.toLowerCase() !== 'pendiente') {
                        const partes = partido.resultado.split('-');

                        if (partes.length === 2 && 
                            partes.every(p => p.trim() !== '' && !isNaN(Number(p.trim())))) {

                            const [golesLocal, golesVisitante] = partes.map(p => Number(p.trim()));

                            if (golesLocal > golesVisitante) {
                                partido.ganador = partido.equipoLocal;

                            } else if (golesLocal < golesVisitante) {
                                partido.ganador = partido.equipoVisitante;

                            } else {
                                partido.ganador = "Empate";
                            }

                        } else {
                            //Resultado con formato invalido
                            this.erroresSintacticos.push({
                                tipo: 'Formato incorrecto',
                                descripcion: `Resultado mal formado: '${partido.resultado}'. Se esperaba formato "X-Y" con numeros`,
                                linea: resultadoToken.linea,
                                columna: resultadoToken.columna,
                                lexema: resultadoToken.valor
                            });
                        }
                    }

                } else {
                    //Si no hubo resultado como cadena
                    const tok = this.tokenActual();
                    this.erroresSintacticos.push({
                        tipo: 'Token invalido',
                        descripcion: 'Se esperaba un valor de resultado entre comillas',
                        linea: tok.linea,
                        columna: tok.columna,
                        lexema: tok.valor
                    });
                }

            } else if (this.esTipo('PALABRA_RESERVADA_GOL')) {
                partido.goleadores.push(this.analizarGoleador());

            } else {
                //Token inesperado dentro del partido
                const tok = this.tokenActual();
                this.erroresSintacticos.push({
                    tipo: 'Token invalido',
                    descripcion: `Token inesperado dentro de partido: ${tok.tipo} (${tok.valor})`,
                    linea: tok.linea,
                    columna: tok.columna,
                    lexema: tok.valor
                });
                this.avanzar(); //Intentar recuperar
            }
        
            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }

        this.coincidir('CORCHETE_DERECHA');
        return partido;
    }

    analizarGoleador() {
        this.coincidir('PALABRA_RESERVADA_GOL');
        this.coincidir('DOS_PUNTOS');

        const nombreGoleadorToken = this.coincidir('CADENA');
        if (!nombreGoleadorToken) {
            //Agregar error y retornar un goleador "dummy"
            const tok = this.tokenActual();
            this.erroresSintacticos.push({
                tipo: 'Token invalido',
                descripcion: 'Se esperaba nombre de goleador entre comillas',
                linea: tok.linea,
                columna: tok.columna,
                lexema: tok.valor
            });
            return new Goleador('NOMBRE_DESCONOCIDO', 0);
        }

        const goleador = new Goleador(nombreGoleadorToken.valor, 0);

        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA') && !this.esTipo('EOF')) {
            if (this.esTipo('ATRIBUTO_MINUTO')) {
                this.coincidir('ATRIBUTO_MINUTO');
                this.coincidir('DOS_PUNTOS');
                const minutoToken = this.coincidir('NUMERO');
                if (minutoToken) {
                    goleador.minuto = parseInt(minutoToken.valor);
                } else {
                    const tok = this.tokenActual();
                    this.erroresSintacticos.push({
                        tipo: 'Token invalido',
                        descripcion: 'Se esperaba numero para el minuto del gol',
                        linea: tok.linea,
                        columna: tok.columna,
                        lexema: tok.valor
                    });
                    //Intentar recuperar
                    this.avanzar();
                }
            } else {
                //Tokens inesperados dentro del goleador -> registrar y avanzar
                const tok = this.tokenActual();
                this.erroresSintacticos.push({
                    tipo: 'Token invalido',
                    descripcion: `Token inesperado dentro de goleador: ${tok.tipo} (${tok.valor})`,
                    linea: tok.linea,
                    columna: tok.columna,
                    lexema: tok.valor
                });
                this.avanzar();
            }

            if (this.esTipo('COMA')) this.avanzar();
        }

        this.coincidir('CORCHETE_DERECHA');
        return goleador;
    }

}