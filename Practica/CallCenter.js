const fs = require("fs");
const readline = require("readline");

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
            console.log(`Línea ${i+1} ignorada: formato incorrecto`);
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
              console.log(`Línea ${i+1} ignorada: ID no válido`);
              continue;
          }

          //PARA CONTAR LAS ESTRELLAS
          const calificacion = this.contarEstrellas(estrellasStr);

          //GUARDAR OPERADOR
          if(!this.operadores.has(idOperador)){
            this.operadores.set(idOperador, {
              id: idOperador, 
              nombre: nombreOperador, 
              llamadasAtendidad: 0
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
            idCliente, 
            nombreCliente
          });

          //INCREMENTAR EL CONTADOR DE LLAMADAS 
          this.operadores.get(idOperador).llamadasAtendidas++;
          registrosCargados++;

        } catch (error) {
          console.log(`Error procesando línea ${i+1}: ${error.message}`);
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

  //MENU PRINCIPAL
  mostrarMenu(){
    console.log("\n====MENU PRINCIPAL====");
    console.log("1. Cargar registros de llamadas");
    console.log("2. Exportar historial de llamadas");
    console.log("3. Exportar listado de operadores");
    console.log("4. Exportar listado de clientes");
    console.log("5. Exportar rendimiento de operadores");
    console.log("6. Mostrar porcentaje de clasificacion de llamadas");
    console.log("7. Mostrar cantidad de llamadas por calificacion");
    console.log("8. Salir");
    console.log("===========================");
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
          console.log("no hay");
          preguntarOpcion();
          break;

        case "2":
          console.log("no hay");
          preguntarOpcion();
          break;
        
        case "3":
          console.log("no hay");
          preguntarOpcion();
          break;

        case "4":
          console.log("no hay");
          preguntarOpcion();
          break;

        case "5":
          console.log("no hay");
          preguntarOpcion();
          break;

        case "6":
          console.log("no hay");
          preguntarOpcion();
          break;

        case "7":
          console.log("no hay");
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