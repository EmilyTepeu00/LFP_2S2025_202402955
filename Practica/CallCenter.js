const fs = require("fs");
const readline = require("readline");
const generadorReportes = require("./reportes");

//CLASE PRINCIPAL
class CallCenter {
  constructor() {
      this.llamadas = [];
      this.operadores = new Map();
      this.clientes = new Map();
  }

  //METODO PARA CARGAR ARCHIVOS CSV
  cargarArchivo(ruta){
    try{
      const datos = fs.readFileSync(ruta, "utf-8");
      const lineas = datos.split('\n').filter(linea => linea.trim() !== "");

      //PARA SALTAR EL ENCABEZADO
      const inicio = lineas[0].includes("id_operador") ? 1 : 0;
      let registrosCargados = 0;

      for (let i = inicio; i < lineas.length; i++){
        const linea = lineas[i].trim();
        if (!linea) continue;

        try{
          const campos = this.dividirLineaCSV(linea);

          if(campos.length < 5){
            console.log(`Linea ${i+1} ignorada: formato incorrecto`);
            continue;
          }

          //PARA PROCESAR LOS CAMPOS
          const idOperador = parseInt(campos[0]);
          const nombreOperador = campos[1];
          const estrellasStr = campos[2];
          const idCliente = parseInt(campos[3]);
          const nombreCliente = campos[4];

          //VALIDAR ID
          if (isNaN(idOperador) || isNaN(idCliente)) {
              console.log(`Linea ${i+1} ignorada: ID no valido`);
              continue;
          }

          //PARA CONTAR LAS ESTRELLAS
          const calificacion = this.contarEstrellas(estrellasStr);

          //DETERMINAR CLASIFICACION
          const clasificacion = this.clasificarLlamada(calificacion);

          //GUARDAR OPERADOR
          if(!this.operadores.has(idOperador)){
            this.operadores.set(idOperador, {
              id: idOperador, 
              nombre: nombreOperador, 
              llamadasAtendidas: 0
            });
          }

          //GUARDAR CLIENTE
          if(!this.clientes.has(idCliente)){
            this.clientes.set(idCliente, {
              id: idCliente, 
              nombre:nombreCliente
            });
          }

          //REGISTRAR LA LLAMADA
          this.llamadas.push({
            idOperador, 
            nombreOperador, 
            calificacion, 
            clasificacion,
            idCliente, 
            nombreCliente
          });

          //INCREMENTAR EL CONTADOR DE LLAMADAS 
          this.operadores.get(idOperador).llamadasAtendidas++;
          registrosCargados++;

        } catch (error) {
          console.log(`Error procesando linea ${i+1}`);
        }
      }

      console.log(`\nSe cargaron ${registrosCargados} registros con exito`);
      console.log(`Total Operadores: ${this.operadores.size}`);
      console.log(`Total Clientes: ${this.clientes.size}`);
      return registrosCargados;

    } catch (error) {
      console.error("\nError al leer el archivo");
      return 0;
    }
  }

  //CLASIFICAR LLAMADA SEGUN LAS ESTRELLAS
  clasificarLlamada(calificacion){
    if(calificacion >= 4) return "Buena";
    if(calificacion >= 2) return "Media";
    return "Mala";
  }

  //PARA DIVIDIR UNA LINEA CSV
  dividirLineaCSV(linea){
    let dentroDeComillas = false;
    let campoActual = "";
    const campos = [];

    for(let i=0; i < linea.length; i++){
      const char = linea[i];

      if(char === '"'){
        dentroDeComillas = !dentroDeComillas;

      } else if(char === ',' && !dentroDeComillas) {
        campos.push(campoActual);
        campoActual = "";
        
      } else {
        campoActual += char;
      }
    }

    campos.push(campoActual); //ULTIMO CAMPO
    return campos;
  }

  //CONTAR LAS ESTRELLAS EN LA CADENA
  contarEstrellas(estrellasStr){
    const partes = estrellasStr.split(";");
    let count = 0;

    for(const parte of partes){
      if(parte.trim().toLowerCase() === "x"){
        count++;
      }
    }

    return count;
  }

  //-----FUNCIONES DE EXPORTACION------

  //EXPORTAR HISTORIAL DE LLAMADAS EN HTML
  exportarHistorialHTML(){
    if(this.llamadas.length === 0){
      console.log("\nNo hay llamadas registradas");
      return false;
    }
    
    try{
      const html = generadorReportes.generarHistorial(this.llamadas);
      generadorReportes.guardarHTML("historial_llamadas.html", html);
      console.log("\nHistorial exportado como 'historial_llamadas.html'");
      return true;
      
    } catch (error) {
      console.log("\nError al exportar historial de llamadas");
      return false;
    }
}

  //EXPORTAR LISTADO DE OPERADORES EN HTML
  exportarOperadoresHTML(){
    if(this.operadores.size === 0){
        console.log("\nNo hay operadores registrados");
        return false;
    }
    
      try{
        const html = generadorReportes.generarOperadores(this.operadores);
        generadorReportes.guardarHTML("listado_operadores.html", html);
        console.log("\nListado de operadores exportado como 'listado_operadores.html'");
        return true;

      } catch (error) {
        console.log("\nError al exportar listado de operadores");
        return false;
      }
  }

  //EXPORTAR LISTADO DE CLIENTES EN HTML
  exportarClientesHTML(){
    if(this.clientes.size === 0){
      console.log("\nNo hay clientes registrados");
      return false;
    }
    
      try{
        const html = generadorReportes.generarClientes(this.clientes);
        generadorReportes.guardarHTML("listado_clientes.html", html);
        console.log("\nListado de clientes exportado como 'listado_clientes.html'");
        return true;

      } catch (error){
        console.log("\nError al exportar el listado de clientes");
        return false;
      }
  }

  //EXPORTAR RENDIMIENTO DE OPERADORES EN HTML
  exportarRendimientoHTML(){
    if(this.operadores.size === 0){
      console.log("\nNo hay operadores registrados");
      return false;
    }

    try{
      const html = generadorReportes.generarRendimientoOp(this.operadores, this.llamadas.length);
      generadorReportes.guardarHTML("rendimiento_operadores.html", html);
      console.log("\nRendimiento de operadores exportado como 'rendimiento_operadores.html'");
      return true;

    } catch (error) {
      console.log("\nError al exportar el rendimiento de operadores")
      return false;
    }
  }

  //MOSTRAR PORCENTAJE DE CLASIFICACION DE LLAMADAS
  mostrarPorcentaje(){
    if(this.llamadas.length === 0){
      console.log("\nNo hay llamadas registradas");
      return false;
    }

    let buenas = 0;
    let medias = 0;
    let malas = 0;

    //CONTAR LLAMADAS POR CLASIFICACION
    for(const llamada of this.llamadas){
      if(llamada.clasificacion === "Buena"){
        buenas++;

      } else if(llamada.clasificacion === "Media"){
        medias++;

      } else if(llamada.clasificacion === "Mala"){
        malas++;
      }
    }

    //CALCULAR PORCENTAJES
    const total = this.llamadas.length;
    const porcentajeBuenas = ((buenas / total) * 100).toFixed(2);
    const porcentajeMedias = ((medias / total) * 100).toFixed(2);
    const porcentajeMalas = ((malas / total) * 100).toFixed(2);

    //MOSTRAR RESULTADOS
    console.log("\n----PORCENTAJE DE LLAMADAS----");
    console.log(`Llamadas Buenas: ${buenas} - ${porcentajeBuenas}%`);
    console.log(`Llamadas Medias: ${medias} - ${porcentajeMedias}%`);
    console.log(`Llamadas Malas: ${malas} - ${porcentajeMalas}%`);
    console.log("------------------------------")
    console.log(`Total de llamadas: ${total}`);
    console.log("------------------------------")

    return true;
  }

  //MOSTRAR CANTIDAD DE LLAMADAS POR CALIFICACION
  mostrarCalificacion(){
    if(this.llamadas.length === 0){
      console.log("\nNo hay llamadas registradas");
      return false;
    }

    //CONTADOR DE ESTRELLAS
    const cantidadEstrellas = [0, 0, 0, 0, 0, 0] //de 0 - 5

    //CONTAR LLAMADAS SEGUN LAS ESTRELLAS
    for(const llamada of this.llamadas){
      if(llamada.calificacion >= 0 && llamada.calificacion <= 5){
        cantidadEstrellas[llamada.calificacion]++;
      }
    }

    //MOSTRAR RESULTADOS
    console.log("\n----CANTIDAD DE LLAMADAS----");
    console.log(`0 estrellas: ${cantidadEstrellas[0]} llamadas`);
    console.log(`1 estrella:  ${cantidadEstrellas[1]} llamadas`);
    console.log(`2 estrellas: ${cantidadEstrellas[2]} llamadas`);
    console.log(`3 estrellas: ${cantidadEstrellas[3]} llamadas`);
    console.log(`4 estrellas: ${cantidadEstrellas[4]} llamadas`);
    console.log(`5 estrellas: ${cantidadEstrellas[5]} llamadas`);
    console.log("---------------------------")
    console.log(`Total:       ${this.llamadas.length} llamadas`);
    console.log("---------------------------")

    return true;
  }

  
  //MENU PRINCIPAL
  mostrarMenu(){
    console.log("\n==================MENU PRINCIPAL==================");
    console.log("1. Cargar registros de llamadas");
    console.log("2. Exportar historial de llamadas");
    console.log("3. Exportar listado de operadores");
    console.log("4. Exportar listado de clientes");
    console.log("5. Exportar rendimiento de operadores");
    console.log("6. Mostrar porcentaje de clasificacion de llamadas");
    console.log("7. Mostrar cantidad de llamadas por calificacion");
    console.log("8. Salir");
    console.log("==================================================");
  }
}

//INSTANCIA DEL CALLCENTER
const callCenter = new CallCenter();

//FUNCION PARA MANEJAR EL MENU
function main(){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function preguntarOpcion(){
    callCenter.mostrarMenu();
    rl.question("Seleccione una opcion: ", (opcion) => {
      switch (opcion){

        case "1":
          rl.question("Ingrese la ruta del archivo CSV: ", (ruta) => {
            callCenter.cargarArchivo(ruta);
            preguntarOpcion();
          });
          break;

        case "2":
          callCenter.exportarHistorialHTML();
          preguntarOpcion();
          break;
        
        case "3":
          callCenter.exportarOperadoresHTML();
          preguntarOpcion();
          break;

        case "4":
          callCenter.exportarClientesHTML();
          preguntarOpcion();
          break;

        case "5":
          callCenter.exportarRendimientoHTML();
          preguntarOpcion();
          break;

        case "6":
          callCenter.mostrarPorcentaje();
          preguntarOpcion();
          break;

        case "7":
          callCenter.mostrarCalificacion();
          preguntarOpcion();
          break;

        case "8":
          console.log("Saliendo del programa...");
          rl.close()
          
        default:
          console.log("Opcion no valida, intente de nuevo");
          preguntarOpcion();
          break;
      }
    });
  }

  console.log("====CALL CENTER====")
  console.log("Bienvenido al sistema de gestion de llamadas");
  preguntarOpcion();
}

//PARA EJECUTAR
if (require.main === module){
  main();
}

module.exports = CallCenter;