'use strict';

// Imports
const Utils = require('./utils');
const Movistar = require('./movistar');
const Cadenas = require('./cadenas');
const s3 = require('./s3');

// =========================================================
// Constantes
// =========================================================
let progPreferences = {

  // CADENAS:
  cadenas: Cadenas,

  // Parámetros para hacer la solicitud a la Web de Movistar: 
  //
  // urlMovistar: URI a donde haremos la petición POST. 
  // dias: número de días de EPG que vamos a solicitar. Nota: he configurado
  //       hardcoded que el máximo aceptado sean 7 (para no cargar a los 
  //       servidores de movistar). 
  urlMovistar: 'http://comunicacion.movistarplus.es/guiaProgramacion/exportar',
  dias: 7,

  // Para mostrar métricas en el log. 
  numChannels: 0,
  numProgrammes: 0,
}

// =========================================================
// Funciones
// =========================================================
function comparaCadenasString(a,b) {
  if (a.movistar_numero < b.movistar_numero)
    return -1;
  if (a.movistar_numero > b.movistar_numero)
    return 1;
  return 0;
}
function comparaCadenasInteger(a,b) {
  let aNum=Number(a.movistar_numero);
  let bNum=Number(b.movistar_numero);
  
  if (aNum < bNum)
    return -1;
  if (aNum > bNum)
    return 1;
  return 0;
}

// =========================================================
// Método principal 
// =========================================================

function generateEPG() {
  progPreferences.dias = Utils.validaDias(progPreferences.dias);
  progPreferences.diasInicioFin = Utils.fechaInicioFin(progPreferences.dias);

  var promise = new Promise(function(resolve, reject) {

    // Inicio el proceso pidiendo el EPG a Movistar
    console.log('--');
    console.log(`Inicio del ciclo de consulta del EPG`);
    console.log('---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ');
    console.log(`1 - Descarga del EPG XML Movistar`);
    console.log(`  => PORT ${progPreferences.urlMovistar}`);
    console.log(`  => EPG ${progPreferences.diasInicioFin.fechaInicio} -> ${progPreferences.diasInicioFin.fechaFin}`);
    Movistar.requestEPG(progPreferences)
      .then((response) => {
          conversionCompletaDeEPGaXMLTV(response.body, resolve);      
      })
      .catch((err) => {
        if (err.error) {
          if (err.error.message) {
            console.log(`1 - Descarga del EPG XML Movistar !! ERROR !!`);
            console.log(`  => Error: ${err.error.message}`);
          }
        }
      });
  });

  return promise;
}

// Postprocesa los datos descargados
function conversionCompletaDeEPGaXMLTV(data, resolve) {
  progPreferences.isConversionRunning = true;
  console.log(`1 - Descarga del EPG XML Movistar - OK`);
  // Convertir de formato XML entregado por Movistar a formato JSON intermedio  
  Utils.convierteXMLaJSON(progPreferences.ficheroXML, data)
    .then((datosJSON) => {
      // Convierto los datos en formato JSON (movistar) a JSON (xmltv)
      console.log(`3 - Convierte JSON(movistar) a JSONTV`);
      let datosJSONTV = Utils.convierteJSONaJSONTV(progPreferences, datosJSON);
      console.log(`3 - Convierte JSON(movistar) a JSONTV - OK`);
      // Convierto los datos en formato JSONTV a XMLTV
      console.log(`4 - Convierte JSONTV a XMLTV`);
      let datosXMLTV = Utils.convierteJSONTVaXMLTV(datosJSONTV);
      console.log(`4 - Convierte JSONTV a XMLTV - OK`);
      console.log(`Hecho!! - ${progPreferences.numChannels} canales y ${progPreferences.numProgrammes} pases`);
      s3.uploadFile(datosXMLTV, resolve);
    })
    .catch((err) => {
      console.log(`Error en la conversion de XML (movistar) a JSON (movistar)`, err);
      if (err.error) {
        if (err.error.message) {
          console.log(`  => Error: ${err.error.message}`);
          progPreferences.isConversionRunning = false;
        }
      }
    });
}

module.exports = generateEPG;