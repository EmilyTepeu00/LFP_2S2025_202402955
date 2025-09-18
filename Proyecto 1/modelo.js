//MODELO DE DATOS PARA LA ESTRUCTURA DEL TORNEO

class Torneo {
    constructor(nombre, cantiadEquipos, sede) {
        this.nombre = nombre;
        this.cantiadEquipos = cantiadEquipos;
        this.sede = sede;
        this.cantiadEquipos = [];
        this.fases = [];
    }
}

class Equipos {
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