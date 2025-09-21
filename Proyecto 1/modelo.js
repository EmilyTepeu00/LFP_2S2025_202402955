//MODELO DE DATOS PARA LA ESTRUCTURA DEL TORNEO

class Torneo {
    constructor(nombre, cantidadEquipos, sede) {
        this.nombre = nombre;
        this.cantidadEquipos = cantidadEquipos;
        this.sede = sede;
        this.equipos = [];
        this.fases = [];
    }
}

class Equipo {
    constructor(nombre) {
        this.nombre = nombre;
        this.jugadores = [];
        this.partidosJugados = 0;
        this.partidosGanados = 0;
        this.partidosPerdidos = 0;
        this.golesFavor = 0;
        this.golesContra = 0;
        this.diferenciaGoles = 0;
        this.faseAlcanzada = "";
    }
}

class Jugador {
    constructor(nombre, posicion, numero, edad) {
        this.nombre = nombre;
        this.posicion = posicion;
        this.numero = numero;
        this.edad = edad;
        this.goles = 0;
        this.minutosGol = [];
    }
}

class Fase {
    constructor(nombre) {
        this.nombre = nombre;
        this.partidos = [];
    }
}

class Partido {
    constructor(equipoLocal, equipoVisitante) {
        this.equipoLocal = equipoLocal;
        this.equipoVisitante = equipoVisitante;
        this.resultado = null;
        this.goleadores = [];
        this.ganador = null;
    }
}

class Goleador {
    constructor(nombreJugador, minuto) {
        this.nombreJugador = nombreJugador;
        this.minuto = minuto;
    }
}

//---METODO PARA CALCULAR ESTADISTICAS---
Equipo.prototype.actualizarEstadisticas = function(partido, esLocal) {
    if (partido.resultado && partido.resultado.toLowerCase() !== 'pendiente') {
        const [golesLocal, golesVisitante] = partido.resultado.split('-').map(Number);
        
        this.partidosJugados++;
        this.golesFavor += esLocal ? golesLocal : golesVisitante;
        this.golesContra += esLocal ? golesVisitante : golesLocal;
        this.diferenciaGoles = this.golesFavor - this.golesContra;
        
        if ((esLocal && golesLocal > golesVisitante) || 
            (!esLocal && golesVisitante > golesLocal)) {
            this.partidosGanados++;
        } else if (golesLocal !== golesVisitante) {
            this.partidosPerdidos++;
        }
    }
};

Torneo.prototype.calcularEstadisticas = function() {
    //Reiniciar estadisticas
    this.equipos.forEach(equipo => {
        equipo.partidosJugados = 0;
        equipo.partidosGanados = 0;
        equipo.partidosPerdidos = 0;
        equipo.golesFavor = 0;
        equipo.golesContra = 0;
        equipo.diferenciaGoles = 0;
        equipo.faseAlcanzada = "No participó";
    });

    //Reiniciar goles de jugadores
    this.equipos.forEach(equipo => {
        equipo.jugadores.forEach(jugador => {
            jugador.goles = 0;
            jugador.minutosGol = [];
        });
    });

    //Procesar partidos
    this.fases.forEach(fase => {
        fase.partidos.forEach(partido => {
            //Encontrar equipos
            const equipoLocal = this.equipos.find(e => e.nombre === partido.equipoLocal);
            const equipoVisitante = this.equipos.find(e => e.nombre === partido.equipoVisitante);

            if (equipoLocal && equipoVisitante) {
                //Actualizar estadisticas de equipos
                equipoLocal.actualizarEstadisticas(partido, true);
                equipoVisitante.actualizarEstadisticas(partido, false);
                
                //Actualizar fase alcanzada
                if (partido.ganador) {
                    const perdedor = partido.ganador === partido.equipoLocal ? 
                                    partido.equipoVisitante : partido.equipoLocal;
                    
                    const equipoGanador = this.equipos.find(e => e.nombre === partido.ganador);
                    const equipoPerdedor = this.equipos.find(e => e.nombre === perdedor);
                    
                    if (equipoGanador) equipoGanador.faseAlcanzada = fase.nombre;
                    if (equipoPerdedor) equipoPerdedor.faseAlcanzada = fase.nombre;
                }

                //Actualizar goleadores
                partido.goleadores.forEach(goleadorInfo => {
                    const jugador = [...equipoLocal.jugadores, ...equipoVisitante.jugadores]
                        .find(j => j.nombre === goleadorInfo.nombreJugador);
                    
                    if (jugador) {
                        jugador.goles++;
                        jugador.minutosGol.push(goleadorInfo.minuto);
                    }
                });
            }
        });
    });
};
