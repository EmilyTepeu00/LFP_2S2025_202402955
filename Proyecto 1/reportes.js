class GeneradorReportes {
    constructor(torneo) {
        this.torneo = torneo;
    }

    //REPORTE DE INFORMACION GENERAL
    generarReporteGeneral() {
        const totalJugadores = this.calcularTotalJugadores();
        const edadPromedio = this.calcularEdadPromedio();
        const totalPartidos = this.calcularTotalPartidos();
        const partidosCompletados = this.calcularPartidosCompletados();
        const totalGoles = this.calcularTotalGoles();
        const faseActual = this.determinarFaseActual();
    
        return `
        <div class="reporte">
            <h3>Información General del Torneo</h3>
            <table>
                <tr><th>Estadística</th><th>Valor</th></tr>
                <tr><td>Nombre del Torneo</td><td>${this.torneo.nombre || 'No especificado'}</td></tr>
                <tr><td>Sede</td><td>${this.torneo.sede || 'No especificada'}</td></tr>
                <tr><td>Equipos Participantes</td><td>${this.torneo.equipos ? this.torneo.equipos.length : 0}</td></tr>
                <tr><td>Total de Partidos Programados</td><td>${totalPartidos}</td></tr>
                <tr><td>Partidos Completados</td><td>${partidosCompletados}</td></tr>
                <tr><td>Total de Goles</td><td>${totalGoles}</td></tr>
                <tr><td>Promedio de Goles por Partido</td><td>${partidosCompletados > 0 ? (totalGoles / partidosCompletados).toFixed(2) : '0.00'}</td></tr>
                <tr><td>Edad Promedio de Jugadores</td><td>${edadPromedio} años</td></tr>
                <tr><td>Fase Actual</td><td>${faseActual}</td></tr>
            </table>
        </div>
        `;
    }

    //REPORTE DE ESTADISTICAS
    generarReporteEstadisticasEquipos() {
        if (!this.torneo.equipos || this.torneo.equipos.length === 0) {
            return '<div class="reporte"><h3>Estadisticas por Equipo</h3><p>No hay equipos registrados</p></div>';
        }

        let html = `
        <div class="reporte">
            <h3>Estadisticas por Equipo</h3>
            <table>
                <tr>
                    <th>Equipo</th>
                    <th>PJ</th>
                    <th>G</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Fase Alcanzada</th>
                </tr>
        `;

        this.torneo.equipos.forEach(equipo => {
            html += `
                <tr>
                    <td>${equipo.nombre}</td>
                    <td>${equipo.partidosJugados}</td>
                    <td>${equipo.partidosGanados}</td>
                    <td>${equipo.partidosPerdidos}</td>
                    <td>${equipo.golesFavor}</td>
                    <td>${equipo.golesContra}</td>
                    <td>${equipo.diferenciaGoles >= 0 ? '+' : ''}${equipo.diferenciaGoles}</td>
                    <td>${equipo.faseAlcanzada || 'No participó'}</td>
                </tr>
            `;
        });

        html += `</table></div>`;
        return html;
    }

    //REPORTE DE GOLEADORES
    generarReporteGoleadores() {
        // Obtener todos los jugadores con goles
        const jugadoresConGoles = [];
        
        this.torneo.equipos.forEach(equipo => {
            equipo.jugadores.forEach(jugador => {
                if (jugador.goles > 0) {
                    jugadoresConGoles.push({
                        jugador: jugador.nombre,
                        equipo: equipo.nombre,
                        goles: jugador.goles,
                        minutos: jugador.minutosGol
                    });
                }
            });
        });

        // Ordenar por goles (descendente)
        jugadoresConGoles.sort((a, b) => b.goles - a.goles);

        if (jugadoresConGoles.length === 0) {
            return '<div class="reporte"><h3>Reporte de Goleadores</h3><p>No hay goleadores registrados</p></div>';
        }

        let html = `
        <div class="reporte">
            <h3>Reporte de Goleadores</h3>
            <table>
                <tr>
                    <th>Posición</th>
                    <th>Jugador</th>
                    <th>Equipo</th>
                    <th>Goles</th>
                    <th>Minutos de Gol</th>
                </tr>
        `;

        let posicion = 1;
        let ultimosGoles = -1;
        let posicionReal = 1;

        jugadoresConGoles.forEach((goleador, index) => {
            // Manejar empates en posición
            if (index > 0 && goleador.goles === jugadoresConGoles[index - 1].goles) {
                posicionReal = posicion;
            } else {
                posicionReal = index + 1;
                posicion = index + 1;
            }

            const minutosFormateados = goleador.minutos.map(m => `${m}'`).join(', ');

            html += `
                <tr>
                    <td>${posicionReal}${goleador.goles === ultimosGoles ? '' : ''}</td>
                    <td>${goleador.jugador}</td>
                    <td>${goleador.equipo}</td>
                    <td>${goleador.goles}</td>
                    <td>${minutosFormateados}</td>
                </tr>
            `;

            ultimosGoles = goleador.goles;
        });

        html += `</table></div>`;
        return html;
    }

    //REPORTE DE BRACKET DE ELIMINACION
    generarReporteBracket() {
        if (!this.torneo.fases || this.torneo.fases.length === 0) {
            return '<div class="reporte"><h3>Bracket de Eliminación</h3><p>No hay datos de fases</p></div>';
        }

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
                    <td>${this.formatearNombreFase(fase.nombre)}</td>
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
        if (!this.torneo.equipos) return '0.00';
    
        const todosJugadores = this.torneo.equipos.flatMap(equipo => 
            equipo.jugadores ? equipo.jugadores : []
        );
    
        if (todosJugadores.length === 0) return '0.00';
    
        const totalEdad = todosJugadores.reduce((sum, jugador) => {
            return sum + (jugador.edad || 0);
        }, 0);
    
        return (totalEdad / todosJugadores.length).toFixed(2);
    }

    calcularTotalPartidos() {
        if (!this.torneo.fases) return 0;
        return this.torneo.fases.reduce((total, fase) => {
            return total + (fase.partidos ? fase.partidos.length : 0);
        }, 0);
    }

    calcularPartidosCompletados() {
        if (!this.torneo.fases) return 0;
        let completados = 0;
        
        this.torneo.fases.forEach(fase => {
            fase.partidos.forEach(partido => {
                if (partido.resultado && partido.resultado.toLowerCase() !== 'pendiente') {
                    completados++;
                }
            });
        });
        
        return completados;
    }

    calcularTotalGoles() {
        if (!this.torneo.fases) return 0;
        let totalGoles = 0;
        
        this.torneo.fases.forEach(fase => {
            fase.partidos.forEach(partido => {
                if (partido.resultado && partido.resultado.toLowerCase() !== 'pendiente') {
                    const [golesLocal, golesVisitante] = partido.resultado.split('-').map(Number);
                    totalGoles += (golesLocal + golesVisitante);
                }
            });
        });
        
        return totalGoles;
    }

    determinarFaseActual() {
        if (!this.torneo.fases || this.torneo.fases.length === 0) {
            return 'No iniciado';
        }
        
        //Buscar la ultima fase con partidos no completados
        for (let i = this.torneo.fases.length - 1; i >= 0; i--) {
            const fase = this.torneo.fases[i];
            const partidosPendientes = fase.partidos.some(partido => 
                !partido.resultado || partido.resultado.toLowerCase() === 'pendiente'
            );
            
            if (partidosPendientes) {
                return this.formatearNombreFase(fase.nombre);
            }
        }
        
        //Si todos los partidos estan completados --> fase final
        return this.formatearNombreFase(this.torneo.fases[this.torneo.fases.length - 1].nombre);
    }

    formatearNombreFase(nombre) {
        const nombres = {
            'cuartos': 'Cuartos de Final',
            'semifinal': 'Semifinal',
            'final': 'Final',
            'tercer': 'Tercer Lugar'
        };
        
        return nombres[nombre.toLowerCase()] || nombre;
    }

    //GENERAR TODOS LOS REPORTES
    generarTodosReportes() {
        return {
            general: this.generarReporteGeneral(),
            estadisticas: this.generarReporteEstadisticasEquipos(),
            goleadores: this.generarReporteGoleadores(),
            bracket: this.generarReporteBracket(),
            graphviz: this.generarGraphviz()
        };
    }

    //GENERAR DIAGRAMAS
    generarGraphviz() {
        if (!this.torneo.fases || this.torneo.fases.length === 0) {
            return "<p>No hay datos de fases para generar el diagrama</p>";
        }

        let dot = `digraph Torneo {
            rankdir=TB
            node [shape=rect, style=filled, fillcolor=lightblue, fontname="Arial"]
            edge [arrowhead=none]
            graph [bgcolor=transparent]
        
            label="Bracket de Torneo: ${this.torneo.nombre || 'Sin nombre'}"
            labelloc=t
            fontsize=20
        \n`;

        //Organizar fases por orden logico
        const fasesOrdenadas = this.ordenarFases(this.torneo.fases);
    
        //Generar nodos y conexiones
        let partidoId = 1;
        let equiposPrevios = new Set();

        fasesOrdenadas.forEach((fase, faseIndex) => {
            dot += `\n    subgraph cluster_${faseIndex} {
                label="${fase.nombre}"
                style=filled
                fillcolor=lightgray
                fontsize=16
            \n`;

            fase.partidos.forEach((partido, partidoIndex) => {
                const nodoId = `partido_${faseIndex}_${partidoIndex}`;
            
                //Crear nodo del partido
                dot += `    ${nodoId} [label="${partido.equipoLocal} vs ${partido.equipoVisitante}\\n${partido.resultado || 'Pendiente'}", width=3, height=1.5];\n`;

                //Conectar con partidos anteriores (si es fase eliminatoria)
                if (faseIndex > 0 && partidoIndex < fase.partidos.length) {
                    const partidosAnteriores = fasesOrdenadas[faseIndex - 1].partidos;
                    if (partidoIndex * 2 < partidosAnteriores.length) {
                        const nodoAnterior1 = `partido_${faseIndex - 1}_${partidoIndex * 2}`;
                        const nodoAnterior2 = `partido_${faseIndex - 1}_${partidoIndex * 2 + 1}`;
                        dot += `    ${nodoAnterior1} -> ${nodoId} [style=dashed, color=gray];\n`;
                        dot += `    ${nodoAnterior2} -> ${nodoId} [style=dashed, color=gray];\n`;
                    }
                }

                //Resaltar ganador
                if (partido.ganador && partido.ganador !== "Por definirse" && partido.ganador !== "Empate") {
                    dot += `    ${nodoId} [fillcolor=lightgreen];\n`;
                }

                partidoId++;
            });

            dot += "    }\n";
        });

        dot += "}";
    
        return this.mostrarGraphviz(dot);
    }

    //PARA ORDENAR FASES
    ordenarFases(fases) {
        const ordenFases = ['cuartos', 'semifinal', 'final', 'tercer lugar'];
        return fases.sort((a, b) => {
            const indexA = ordenFases.indexOf(a.nombre.toLowerCase());
            const indexB = ordenFases.indexOf(b.nombre.toLowerCase());
            return indexA - indexB;
        });
    }

    //MOSTRAR GRAFICA
    mostrarGraphviz(dotCode) {
        return `
        <div class="reporte">
            <h3>Diagrama de Bracket - Graphviz</h3>
            <div class="graphviz-container">
                <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto;">
    ${dotCode}
                </pre>
                <p><strong>Nota:</strong> Copie este codigo en <a href="https://dreampuf.github.io/GraphvizOnline/" target="_blank">Graphviz Online</a> para ver el diagrama</p>
            </div>
        </div>
        `;
    }
}