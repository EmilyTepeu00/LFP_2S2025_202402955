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

        if (token.tipo === tipoEsperado) {
            this.avanzar();
            return token;
        
        } else {
            const errorMsg = `Se esperaba ${tipoEsperado} pero se encontró ${token.tipo} (${token.valor})`;
            const error = {
                tipo: 'Error Sintactico',
                descripcion: errorMsg,
                linea: token.linea,
                columna: token.columna
            };

            this.erroresSintacticos.push(error);
            console.error("ERROR SINTACTICO", error);

            throw new Error(errorMsg)
        }
    }

    esTipo(tipo) {
        return this.tokenActual().tipo === tipo;
    }

    //-----REGLAS GRAMATICALES-----

    analizarTorneo(){
        this.coincidir('PALABRA_RESERVADA_TORNEO');
        this.coincidir('LLAVE_IZQUIERDA');

        let nombre = '';
        let cantidadEquipos = 0;
        let sede = '';

        while (!this.esTipo('LLAVE_DERECHA')) {
            const atributo = this.coincidir('ATRIBUTO_NOMBRE') || 
                           this.coincidir('ATRIBUTO_EQUIPOS') || 
                           this.coincidir('ATRIBUTO_SEDE');

            if (!atributo) break;

            this.coincidir('DOS_PUNTOS');

            if (atributo.tipo === 'ATRIBUTO_NOMBRE' || atributo.tipo === 'ATRIBUTO_SEDE') {
                const valor = this.coincidir('CADENA');
                if (atributo.tipo === 'ATRIBUTO_NOMBRE') nombre = valor.valor;
                if (atributo.tipo === 'ATRIBUTO_SEDE') sede = valor.valor;
            
            } else if (atributo.tipo === 'ATRIBUTO_EQUIPOS') {
                const valor = this.coincidir('NUMERO');
                cantidadEquipos = parseInt(valor.valor);
            }

            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }

        this.coincidir('LLAVE_DERECHA')

        const torneo = new Torneo(nombre, cantidadEquipos, sede);

        //ANALIZAR EQUIPOS
        if (this.esTipo('PALABRA_RESERVADA_EQUIPOS')) {
            torneo.equipos = this.analizarEquipos();
        }

        //ANALIZAR ELIMINACION
        if (this.esTipo('PALABRA_RESERVADA_ELIMINACION')) {
            torneo.fases = this.analizarEliminacion();
        }

        return torneo;
    }

    analizarEquipos() {
        const equipos = [];

        this.coincidir('PALABRA_RESERVADA_EQUIPOS');
        this.coincidir('LLAVE_IZQUIERDA');

        while (!this.esTipo('LLAVE_DERECHA')) {
            if (this.esTipo('PALABRA_RESERVADA_EQUIPO')) {
                equipos.push(this.analizarEquipo());

            } else {
                this.avanzar(); //saltar tokens inesperados
            }
        }

        this.coincidir('LLAVE_DERECHA');
        return equipos;
    }

    analizarEquipo() {
        this.coincidir('PALABRA_RESERVADA_EQUIPO');
        this.coincidir('DOS_PUNTOS');
        
        const nombreEquipoToken = this.coincidir('CADENA');
        const equipo = new Equipo(nombreEquipoToken.valor);

        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA')) {
            if (this.esTipo('PALABRA_RESERVADA_JUGADOR')) {
                equipo.jugadores.push(this.analizarJugador());

            } else {
                const token = this.tokenActual();
                throw new Error(`Token inesperado en equipo: ${token.tipo} (${token.valor})`);
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

        while (!this.esTipo('CORCHETE_DERECHA')) {
            const atributo = this.coincidir('ATRIBUTO_POSICION') ||
                            this.coincidir('ATRIBUTO_NUMERO') || 
                            this.coincidir('ATRIBUTO_EDAD');
            
            if (!atributo) break;
            
            this.coincidir('DOS_PUNTOS');
            
            if (atributo.tipo === 'ATRIBUTO_POSICION') {
                const valor = this.coincidir('VALOR_PORTERO') || 
                            this.coincidir('VALOR_DEFENSA') || 
                            this.coincidir('VALOR_MEDIOCAMPO') || 
                            this.coincidir('VALOR_DELANTERO');

                if (valor) {
                    jugador.posicion = valor.tipo.replace('VALOR_', '');
                }

            } else if (atributo.tipo === 'ATRIBUTO_NUMERO') {
                const valor = this.coincidir('NUMERO');
                if (valor) {
                    jugador.numero = parseInt(valor.valor);
                }
                
            } else if (atributo.tipo === 'ATRIBUTO_EDAD') {
                const valor = this.coincidir('NUMERO');
                if (valor) {
                    jugador.edad = parseInt(valor.valor);
                }
            }
            
            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }

        this.coincidir('CORCHETE_DERECHA');
        return jugador;
    }

    analizarEliminacion() {
        const fases = [];

        this.coincidir('PALABRA_RESERVADA_ELIMINACION');
        this.coincidir('LLAVE_IZQUIERDA');

        while (!this.esTipo('LLAVE_DERECHA')) {
            //FASES: cuartos, semifinal, final
            const nombreFaseToken = this.coincidir('IDENTIFICADOR');
            if (nombreFaseToken) {
                const fase = new Fase(nombreFaseToken.valor);
                this.coincidir('DOS_PUNTOS');
                this.coincidir('CORCHETE_IZQUIERDA');
                
                while (!this.esTipo('CORCHETE_DERECHA')) {
                    if (this.esTipo('PALABRA_RESERVADA_PARTIDO')) {
                        fase.partidos.push(this.analizarPartido());

                    } else {
                        this.avanzar();
                    }
                    
                    if (this.esTipo('COMA')) {
                        this.avanzar();
                    }
                }
                
                this.coincidir('CORCHETE_DERECHA');
                fases.push(fase);

            } else {
                this.avanzar();
            }
            
            if (this.esTipo('COMA')) {
                this.avanzar();
            }
        }
        
        this.coincidir('LLAVE_DERECHA');
        return fases;
    }

    analizarPartido() {
        this.coincidir('PALABRA_RESERVADA_PARTIDO');
        this.coincidir('DOS_PUNTOS');
        
        const equipoLocalToken = this.coincidir('CADENA');
        this.coincidir('VS');
        const equipoVisitanteToken = this.coincidir('CADENA');
        
        const partido = new Partido(equipoLocalToken.valor, equipoVisitanteToken.valor);
        
        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA')) {
            if (this.esTipo('PALABRA_RESERVADA_RESULTADO')) {
                this.coincidir('PALABRA_RESERVADA_RESULTADO');
                this.coincidir('DOS_PUNTOS');
                const resultadoToken = this.coincidir('CADENA');
                partido.resultado = resultadoToken.valor;
                
                // Determinar ganador basado en resultado
                if (partido.resultado !== 'Pendiente') {
                    const [golesLocal, golesVisitante] = partido.resultado.split('-').map(Number);
                    partido.ganador = golesLocal > golesVisitante ? partido.equipoLocal : partido.equipoVisitante;
                }

            } else if (this.esTipo('PALABRA_RESERVADA_GOL')) {
                partido.goleadores.push(this.analizarGoleador());

            } else {
                this.avanzar();
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
        const goleador = new Goleador(nombreGoleadorToken.valor, 0);

        this.coincidir('CORCHETE_IZQUIERDA');

        while (!this.esTipo('CORCHETE_DERECHA')) {
        if (this.esTipo('ATRIBUTO_MINUTO')) {
            this.coincidir('ATRIBUTO_MINUTO');
            this.coincidir('DOS_PUNTOS');
            const minutoToken = this.coincidir('NUMERO');
            goleador.minuto = parseInt(minutoToken.valor);
            
        } else {
            this.avanzar();
        }
    }
    
    this.coincidir('CORCHETE_DERECHA');
    return goleador;
    }
}