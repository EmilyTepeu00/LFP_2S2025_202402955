class GenradorReportes {
    constructor(torneo) {
        this.torneo = torneo;
    }

    //REPORTE DE INFORMACION GENERAL
    generarReporteGeneral() {
        return `
        <div class="reporte">
            <h3>Información General del Torneo</h3>
            <table>
                <tr><th>Estadística</th><th>Valor</th></tr>
                <tr><td>Nombre del Torneo</td><td>${this.torneo.nombre}</td></tr>
                <tr><td>Sede</td><td>${this.torneo.sede}</td></tr>
                <tr><td>Equipos Participantes</td><td>${this.torneo.equipos.length}</td></tr>
                <tr><td>Total de Jugadores</td><td>${this.calcularTotalJugadores()}</td></tr>
                <tr><td>Edad Promedio</td><td>${this.calcularEdadPromedio()} años</td></tr>
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
        return this.torneo.equipos.reduce((total, equipo) => total + equipo.jugadores.length, 0);
    }

    calcularEdadPromedio() {
        const todosJugadores = this.torneo.equipos.flatMap(equipo => equipo.jugadores);
        const totalEdad = todosJugadores.reduce((sum, jugador) => sum + jugador.edad, 0);
        return todosJugadores.length > 0 ? (totalEdad / todosJugadores.length).toFixed(2) : '0';
    }

    calcularEdadPromedioEquipo(equipo) {
        const totalEdad = equipo.jugadores.reduce((sum, jugador) => sum + jugador.edad, 0);
        return equipo.jugadores.length > 0 ? (totalEdad / equipo.jugadores.length).toFixed(2) : '0';
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