const fs = require("fs");

class generadorReportes{

    //REPORTE DE HISTORIAL DE LLAMADAS
    static generarHistorial(llamadas){
        if(llamadas.length === 0){
            throw new Error("No hay llamadas para exportar");
        }

        let filasTabla = "";
        
        for(const llamada of llamadas){
            filasTabla += `
            <tr>
                <td>${llamada.idOperador}</td>
                <td>${llamada.nombreOperador}</td>
                <td>${llamada.calificacion}</td>
                <td>${llamada.clasificacion}</td>
                <td>${llamada.idCliente}</td>
                <td>${llamada.nombreCliente}</td>
            </tr>`;
        }

        const html = `<!DOCTYPE html> 
<html>
<head>
    <meta charset="UTF-8">
    <title>Historial de Llamadas</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Historial de Llamadas</h1>
    <table>
        <thead>
            <tr>
                <th>ID OPERADOR</th>
                <th>Nombre Operador</th>
                <th>Calificacion</th>
                <th>Clasificacion</th>
                <th>ID Cliente</th>
                <th>Nombre Cliente</th>
            </tr>
        </thead>
        <tbody>
            ${filasTabla}
        </tbody>
    </table>
    <p>Total de llamadas: ${llamadas.length}</p>
</body>
</html>`;

        return html;
    }

    //REPORTE DE LISTADO DE OPERADORES
    static generarOperadores(operadores){
        if(operadores.size === 0){
            throw new Error("No hay operadores para exportar");
        }

        const operadoresArray = Array.from(operadores.values());
        operadoresArray.sort((a, b) => a.id - b.id);

        let filasTabla = "";

        for(const operador of operadoresArray){
            filasTabla += `
            <tr>
                <td>${operador.id}</td>
                <td>${operador.nombre}</td>
                <td>${operador.llamadasAtendidas}</td>
            </tr>`;
        }

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Listado de Operadores</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Listado de Operadores</h1>
    <table>
        <thead>
            <tr>
                <th>ID Operador</th>
                <th>Nombre Operador</th>
                <th>Llamadas atendidas</th>
            </tr>
        </thead>
        <tbody>
            ${filasTabla}
        </tbody>
    </table>
    <p>Total de operadores: ${operadores.size}</p>
</body>
</html>`;

        return html;
    }

    //REPORTE DE LISTADO DE CLIENTES
    static generarClientes(clientes){
        if(clientes.size === 0){
            throw new Error("No hay clientes para exporatar");
        }

        const clientesArray = Array.from(clientes.values());
        clientesArray.sort((a, b) => a.id - b.id);

        let filasTabla = "";

        for(const cliente of clientesArray) {
            filasTabla += `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
            </tr>`;
        }

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Listado de Clientes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Listado de Clientes</h1>
    <table>
        <thead>
            <tr>
                <th>ID Cliente</th>
                <th>Nombre Cliente</th>
            </tr>
        </thead>
        <tbody>
            ${filasTabla}
        </tbody>
    </table>
    <p>Total de clientes: ${clientes.size}</p>
</body>
</html>`;

        return html;
    }

    //REPORTE DE RENDIMIENTO DE OPERADORES
    static generarRendimientoOp(operadores, totalLlamadasGlobales){
        if(operadores.size === 0){
            throw new Error("No hay operadores para exportar");
        }

        const operadoresArray = Array.from(operadores.values())
        operadoresArray.sort((a, b) => a.id - b.id);

        let filasTabla = "";

        for(const operador of operadoresArray){
            const porcentajeAtencion = totalLlamadasGlobales > 0
            ? ((operador.llamadasAtendidas / totalLlamadasGlobales) * 100).toFixed(2) : "0.00";

            filasTabla += `
            <tr>
                <td>${operador.id}</td>
                <td>${operador.nombre}</td>
                <td>${operador.llamadasAtendidas}</td>
                <td>${porcentajeAtencion}%</td>
            </tr>`;
        }

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rendimiento de Operadores</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Rendimiento de Operadores</h1>
    <table>
        <thead>
            <tr>
                <th>ID Operador</th>
                <th>Nombre Operador</th>
                <th>Llamadas Atendidas</th>
                <th>Porcentaje de Atencion</th>
            </tr>
        </thead>
        <tbody>
            ${filasTabla}
        </tbody>
    </table>
    <p>Total de llamadas globales: ${totalLlamadasGlobales}</p>
    <p>Total de operadores: ${operadores.size}</p>
</body>
</html>`;

        return html;
    }

    //PARA GUARDAR LOS ARCHIVOS HTML
    static guardarHTML(nombreArchivo, contenido){
        try{
            fs.writeFileSync(nombreArchivo, contenido, "utf-8");
            return true;
        } catch (error){
            throw new Error("Error al guardar el archivo");
        }
    }
}

module.exports = generadorReportes;