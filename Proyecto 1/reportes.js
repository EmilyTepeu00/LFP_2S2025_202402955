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