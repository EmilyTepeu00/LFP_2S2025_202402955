class GeneradorReportes {
    constructor(torneo) {
        this.torneo = torneo;
    }

    //REPORTE DE INFORMACION GENERAL
    generarReporteGeneral() {
        const totalJugadores = this.calcularTotalJugadores();
        const edadPromedio = this.calcularEdadPromedio();
    
        return `
        <div class="reporte">
            <h3>Información General del Torneo</h3>
            <table>
                <tr><th>Estadística</th><th>Valor</th></tr>
                <tr><td>Nombre del Torneo</td><td>${this.torneo.nombre || 'No especificado'}</td></tr>
                <tr><td>Sede</td><td>${this.torneo.sede || 'No especificada'}</td></tr>
                <tr><td>Equipos Participantes</td><td>${this.torneo.equipos ? this.torneo.equipos.length : 0}</td></tr>
                <tr><td>Total de Jugadores</td><td>${totalJugadores}</td></tr>
                <tr><td>Edad Promedio</td><td>${edadPromedio} años</td></tr>
            </table>
        </div>
        `;
    }

    //REPORTE DE EQUIPOS Y JUGADORES
    generarReporteEquipos() {
        let html = `
        <div class="reporte">
            <h3>Equipos Participantes</h3>
            <table>
                <tr>
                    <th>Equipo</th>
                    <th>Jugadores</th>
                    <th>Edad Promedio</th>
                </tr>
        `;

        this.torneo.equipos.forEach(equipo => {
            html += `
                <tr>
                    <td>${equipo.nombre}</td>
                    <td>${equipo.jugadores.length}</td>
                    <td>${this.calcularEdadPromedioEquipo(equipo)} años</td>
                </tr>
            `;
        });

        html += `</table></div>`;
        return html;
    }

    //REPORTE DE BRACKET DE ELIMINACION
    generarReporteBracket() {
        let html = `
        <div class="reporte">
            <h3>Bracket de Eliminación</h3>
            <table>
                <tr>
                    <th>Fase</th>
                    <th>Partido</th>
                    <th>Resultado</th>
                    <th>Ganador</th>
                </tr>
        `;

        this.torneo.fases.forEach(fase => {
            fase.partidos.forEach(partido => {
                html += `
                <tr>
                    <td>${fase.nombre}</td>
                    <td>${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
                    <td>${partido.resultado || 'Pendiente'}</td>
                    <td>${partido.ganador || 'Por definirse'}</td>
                </tr>
                `;
            });
        });

        html += `</table></div>`;
        return html;
    }

    //-----METODOS AUXILIARES-----
    
    calcularTotalJugadores() {
        if (!this.torneo.equipos) return 0;
        return this.torneo.equipos.reduce((total, equipo) => {
            return total + (equipo.jugadores ? equipo.jugadores.length : 0);
        }, 0);
    }

    calcularEdadPromedio() {
        if (!this.torneo.equipos) return '0';
    
        const todosJugadores = this.torneo.equipos.flatMap(equipo => 
            equipo.jugadores ? equipo.jugadores : []
        );
    
        if (todosJugadores.length === 0) return '0';
    
        const totalEdad = todosJugadores.reduce((sum, jugador) => {
            return sum + (jugador.edad || 0);
        }, 0);
    
        return (totalEdad / todosJugadores.length).toFixed(2);
    }

    calcularEdadPromedioEquipo(equipo) {
        if (!equipo.jugadores || equipo.jugadores.length === 0) return '0';
        const totalEdad = equipo.jugadores.reduce((sum, jugador) => sum + (jugador.edad || 0), 0);
        return (totalEdad / equipo.jugadores.length).toFixed(2);
    }

    //GENERAR TODOS LOS REPORTES
    generarTodosReportes() {
        return {
            general: this.generarReporteGeneral(),
            equipos: this.generarReporteEquipos(),
            bracket: this.generarReporteBracket()
        };
    }
}