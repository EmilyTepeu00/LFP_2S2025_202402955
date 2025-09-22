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
                    <th>Jugados</th>
                    <th>Ganados</th>
                    <th>Perdidos</th>
                    <th>G. Favor</th>
                    <th>G. Contra</th>
                    <th>Diferencia</th>
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
        //Obtener todos los jugadores con goles
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

        //Ordenar por goles (descendente)
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
            //Manejar empates en posicion
            if (index > 0 && goleador.goles === jugadoresConGoles[index - 1].goles) {
                posicionReal = posicion;
                
            } else {
                posicionReal = index + 1;
                posicion = index + 1;
            }

            //Formatear minutos
            const minutosFormateados = [];
            for (let i = 0; i < goleador.minutos.length; i++) {
                minutosFormateados.push(goleador.minutos[i] + "'");
            }
            const minutosStr = minutosFormateados.join(', ');

            html += `
                <tr>
                    <td>${posicionReal}${goleador.goles === ultimosGoles ? '' : ''}</td>
                    <td>${goleador.jugador}</td>
                    <td>${goleador.equipo}</td>
                    <td>${goleador.goles}</td>
                    <td>${minutosStr}</td>
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

        //Orden de las fases
        const ordenFases = ['octavos', 'cuartos', 'semifinal', 'final'];
    
        //Encontrar la fase mas temprana definida
        let primeraFaseIndex = ordenFases.length;
        this.torneo.fases.forEach(fase => {
            const index = ordenFases.indexOf(fase.nombre.toLowerCase());
            if (index !== -1 && index < primeraFaseIndex) {
                primeraFaseIndex = index;
            }
        });

        //Si no se encontró ninguna fase valida
        if (primeraFaseIndex === ordenFases.length) {
            return '<div class="reporte"><h3>Bracket de Eliminación</h3><p>No hay fases validas definidas</p></div>';
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

        //Procesar solo las fases desde la primera definida en adelante
        for (let i = primeraFaseIndex; i < ordenFases.length; i++) {
            const nombreFase = ordenFases[i];
            const faseExistente = this.torneo.fases.find(f => 
                f.nombre.toLowerCase() === nombreFase.toLowerCase()
            );

            if (faseExistente) {
                //Mostrar partidos de la fase existente
                faseExistente.partidos.forEach(partido => {
                    html += `
                    <tr>
                        <td>${this.formatearNombreFase(faseExistente.nombre)}</td>
                        <td>${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
                        <td>${partido.resultado || 'Pendiente'}</td>
                        <td>${partido.ganador || 'Por definirse'}</td>
                    </tr>
                    `;
                });
            } else {
                //Mostrar fase como pendiente (si es posterior a la primera fase definida)
                html += `
                <tr>
                    <td>${this.formatearNombreFase(nombreFase)}</td>
                    <td>Pendiente vs Pendiente</td>
                    <td>Pendiente</td>
                    <td>Por definirse</td>
                </tr>
                `;
            }
        }

        html += `</table></div>`;
        return html;
    }

    //-----METODOS AUXILIARES-----
    
    calcularTotalJugadores() {
        if (!this.torneo.equipos) return 0;
        let total = 0;
        for (let i = 0; i < this.torneo.equipos.length; i++) {
            total += this.torneo.equipos[i].jugadores ? this.torneo.equipos[i].jugadores.length : 0;
        }
        return total;
    }

    calcularEdadPromedio() {
        if (!this.torneo.equipos) return '0.00';

        const todosJugadores = [];
        this.torneo.equipos.forEach(equipo => {
            if (equipo.jugadores) {
                equipo.jugadores.forEach(jugador => {
                    todosJugadores.push(jugador);
                });
            }
        });

        if (todosJugadores.length === 0) return '0.00';

        const totalEdad = todosJugadores.reduce((sum, jugador) => {
            return sum + (jugador.edad || 0);
        }, 0);

        return (totalEdad / todosJugadores.length).toFixed(2);
    }

    calcularTotalPartidos() {
        if (!this.torneo.fases) return 0;
        let total = 0;
        for (let i = 0; i < this.torneo.fases.length; i++) {
            total += this.torneo.fases[i].partidos ? this.torneo.fases[i].partidos.length : 0;
        }
        return total;
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
                    const partes = partido.resultado.split('-');
                    if (partes.length === 2) {
                        const golesLocal = parseInt(partes[0]) || 0;
                        const golesVisitante = parseInt(partes[1]) || 0;
                        totalGoles += (golesLocal + golesVisitante);
                    }
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
            let partidosPendientes = false;
            
            for (let j = 0; j < fase.partidos.length; j++) {
                const partido = fase.partidos[j];
                if (!partido.resultado || partido.resultado.toLowerCase() === 'pendiente') {
                    partidosPendientes = true;
                    break;
                }
            }
            
            if (partidosPendientes) {
                return this.formatearNombreFase(fase.nombre);
            }
        }
        
        //Si todos los partidos estan completados --> fase final
        return this.formatearNombreFase(this.torneo.fases[this.torneo.fases.length - 1].nombre);
    }

    formatearNombreFase(nombre) {
        const nombreLower = nombre.toLowerCase();
    
        if (nombreLower === 'octavos') return 'Octavos de Final';
        if (nombreLower === 'cuartos') return 'Cuartos de Final';
        if (nombreLower === 'semifinal') return 'Semifinal';
        if (nombreLower === 'final') return 'Final';
    
        if (nombreLower === 'octavos de final') return 'Octavos de Final';
        if (nombreLower === 'cuartos de final') return 'Cuartos de Final';
    
        return nombre.charAt(0).toUpperCase() + nombre.slice(1); //Capitalizar primera letra
    }

    //GENERAR TODOS LOS REPORTES
    generarTodosReportes() {
        return {
            general: this.generarReporteGeneral(),
            estadisticas: this.generarReporteEstadisticasEquipos(),
            goleadores: this.generarReporteGoleadores(),
            bracket: this.generarReporteBracket()
        };
    }

    //GENERAR DIAGRAMAS
    generarGraphviz() {
        if (!this.torneo.fases || this.torneo.fases.length === 0) {
            return "<p>No hay datos de fases para generar el diagrama</p>";
        }

        let dot = `digraph Torneo {
            rankdir=TB
            graph [bgcolor=transparent, fontname="Arial"]
            node [fontname="Arial"]
            edge [fontname="Arial"]
        
            //ESTILOS
            node [shape=rect, style=filled, fillcolor=lightblue, width=2.0, height=0.9]
            node [fontsize=12]
            edge [arrowsize=0.8]
        
            //TITULO EN OVALO
            titulo [label="${this.torneo.nombre || 'Torneo'}", shape=oval, style=filled, fillcolor=gold, fontsize=16, width=2.5, height=0.8]
        \n`;

        //Organizar fases por orden logico
        const ordenFases = ['octavos', 'cuartos', 'semifinal', 'final'];
        const fasesOrdenadas = this.ordenarFases(this.torneo.fases);
    
        //Diccionario para rastrear equipos y sus posiciones
        const equiposPorFase = {};
        const partidosInfoPorFase = {};
    
        //Generar cuadros para cada fase (clusters)
        fasesOrdenadas.forEach((fase, faseIndex) => {
            const faseNombreFormateado = this.formatearNombreFase(fase.nombre);
        
            dot += `\n    subgraph cluster_${faseIndex} {
            label="${faseNombreFormateado}"
            style=filled
            fillcolor=lightgray
            color=black
            fontsize=14
            penwidth=2
            margin=20
        \n`;
        
            equiposPorFase[fase.nombre] = [];
            partidosInfoPorFase[fase.nombre] = [];
        
            fase.partidos.forEach((partido, partidoIndex) => {
                const nodoId = `partido_${faseIndex}_${partidoIndex}`;
                const equipoLocal = partido.equipoLocal;
                const equipoVisitante = partido.equipoVisitante;
            
                //Determinar resultado y colores
                let golesLocal = '0';
                let golesVisitante = '0';
                let colorLocal = 'lightblue';
                let colorVisitante = 'lightblue';
                let ganador = null;
            
                if (partido.resultado && partido.resultado.toLowerCase() !== 'pendiente') {
                    [golesLocal, golesVisitante] = partido.resultado.split('-').map(g => g.trim());
                
                    const golesLocalNum = parseInt(golesLocal);
                    const golesVisitanteNum = parseInt(golesVisitante);
                
                    if (golesLocalNum > golesVisitanteNum) {
                        colorLocal = 'lightgreen';
                        colorVisitante = 'lightcoral';
                        ganador = equipoLocal;
                    } else if (golesVisitanteNum > golesLocalNum) {
                        colorLocal = 'lightcoral';
                        colorVisitante = 'lightgreen';
                        ganador = equipoVisitante;
                    }
                } else {
                    //Para partidos pendientes
                    golesLocal = '-';
                    golesVisitante = '-';
                }
            
                //Nodos para los equipos con goles
                const nodoLocal = `${nodoId}_local`;
                const nodoVisitante = `${nodoId}_visitante`;
            
                dot += `        ${nodoLocal} [label="${this.acortarTexto(equipoLocal, 15)}\\\: ${golesLocal}", fillcolor="${colorLocal}"];\n`;
                dot += `        ${nodoVisitante} [label="${this.acortarTexto(equipoVisitante, 15)}\\\:${golesVisitante}", fillcolor="${colorVisitante}"];\n`;
            
                //Agrupar equipos en la misma fase
                equiposPorFase[fase.nombre].push(nodoLocal, nodoVisitante);
            
                //Guardar informacion completa del partido
                partidosInfoPorFase[fase.nombre] = partidosInfoPorFase[fase.nombre] || [];
                partidosInfoPorFase[fase.nombre].push({
                    nodoLocal: nodoLocal,
                    nodoVisitante: nodoVisitante,
                    equipoLocal: equipoLocal,
                    equipoVisitante: equipoVisitante,
                    golesLocal: golesLocal,
                    golesVisitante: golesVisitante,
                    ganador: ganador,
                    partidoIndex: partidoIndex,
                    faseNombre: fase.nombre
                });
            
                //Conectar equipos del mismo partido con linea punteada
                dot += `        ${nodoLocal} -> ${nodoVisitante} [style=invis];\n`;
            });
        
            //Agrupar equipos de la misma fase horizontalmente
            if (equiposPorFase[fase.nombre].length > 0) {
                dot += `        {rank=same; ${equiposPorFase[fase.nombre].join('; ')}}\n`;
            }
        
            dot += `    }\n`; //Cerrar cluster de la fase
        });
    
        //CONEXIONES ENTRE FASES - PARA CUALQUIER CANTIDAD DE EQUIPOS
        for (let i = 0; i < fasesOrdenadas.length - 1; i++) {
            const faseActualObj = fasesOrdenadas[i];
            const faseSiguienteObj = fasesOrdenadas[i + 1];
        
            const partidosActuales = partidosInfoPorFase[faseActualObj.nombre];
            const partidosSiguientes = partidosInfoPorFase[faseSiguienteObj.nombre];
        
            //Solo generar flechas si ambas fases existen
            if (partidosActuales && partidosSiguientes) {
            
                //Para cada partido de la fase siguiente
                for (let j = 0; j < partidosSiguientes.length; j++) {
                    const partidoSiguiente = partidosSiguientes[j];
                
                    //Calcular que partidos de la fase actual alimentan este partido
                    const partidosPorPartidoSiguiente = Math.ceil(partidosActuales.length / partidosSiguientes.length);
                    const inicio = j * partidosPorPartidoSiguiente;
                    const fin = Math.min(inicio + partidosPorPartidoSiguiente, partidosActuales.length);
                
                    //Para cada partido de la fase actual que alimenta este partido de la fase siguiente
                    for (let k = inicio; k < fin; k++) {
                        if (k < partidosActuales.length) {
                            const partidoActual = partidosActuales[k];
                        
                            //Determinar a que equipo del partido siguiente apunta este partido
                            const equipoDestino = (k - inicio) % 2 === 0 ? partidoSiguiente.nodoLocal : partidoSiguiente.nodoVisitante;
                        
                            //FLECHA NEGRA (ganador → equipo destino)
                            if (partidoActual.ganador === partidoActual.equipoLocal) {
                                dot += `    ${partidoActual.nodoLocal} -> ${equipoDestino} [color="black", penwidth=2, label="✅"];\n`;
                            } else if (partidoActual.ganador === partidoActual.equipoVisitante) {
                                dot += `    ${partidoActual.nodoVisitante} -> ${equipoDestino} [color="black", penwidth=2, label="✅"];\n`;
                            }
                        
                            //FLECHA ROJA (perdedor → equipo destino)
                            if (partidoActual.ganador) {
                                const perdedor = partidoActual.ganador === partidoActual.equipoLocal ? 
                                            partidoActual.nodoVisitante : partidoActual.nodoLocal;
                                dot += `    ${perdedor} -> ${equipoDestino} [color="red", penwidth=2, style=dashed, label="❌"];\n`;
                            }
                        }
                    }
                }
            }
        }
    
        //Conectar titulo con la primera fase existente
        const primeraFaseExistente = fasesOrdenadas[0];
        if (primeraFaseExistente && equiposPorFase[primeraFaseExistente.nombre]) {
            const primeraFaseEquipos = equiposPorFase[primeraFaseExistente.nombre];
            dot += `    titulo -> {${primeraFaseEquipos.join(' ')}} [style=invis];\n`;
        }

        dot += "}";
    
        return this.mostrarGraphviz(dot);
    }

    //FUNCION PARA ACORTAR TEXTO MUY LARGO
    acortarTexto(texto, maxLength) {
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength - 3) + '...';
    }

    //PARA ORDENAR FASES
    ordenarFases(fases) {
        const ordenFases = ['octavos', 'cuartos', 'semifinal', 'final'];
        return fases.sort((a, b) => {
            let indexA = ordenFases.indexOf(a.nombre.toLowerCase());
            let indexB = ordenFases.indexOf(b.nombre.toLowerCase());
        
            //Si no se encuentra en la lista --> al final
            if (indexA === -1) indexA = ordenFases.length;
            if (indexB === -1) indexB = ordenFases.length;
        
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