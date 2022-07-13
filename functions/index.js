const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});;    

const serviceAccount = require("./permissions.json");
admin.initializeApp({
// importante el archivo permissions.json
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lugares-y-puntos-118bd.firebaseio.com",
});





  //CREAR  PUNTOS
 const db = admin.firestore();  

  exports.newPunto = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    const {nombre, latitud, longitud} = request.body;
  
    response.set('Access-Control-Allow-Origin', '*');
    cors(request, response, () => {

      (async () => {
        try {
          await db.collection("puntos").doc().create({
            nombre: nombre,
            latitud: latitud,
            longitud: longitud,
          });

          await db.collection("puntos").where("nombre", "==", nombre)
          .get()
          .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              //const idRef = doc.id
              //addPuntosDeReferencia(idRef,puntosDeReferencia)
              const {id}= doc
  
              return response.status(200).send({ ok: true, msg: "Punto guardado correctamente", punto: {id} });
          });
      })
    
          
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para guardar el punto" });
        }
      })();
  })
    
  });
//VER TODOS LOS PUNTOS
  exports.obtenerPuntos = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    cors(request, response, () => {

      (async () => {
        try {
          let query = db.collection("puntos");
          const querySnapshot = await query.get();
          let docs = querySnapshot.docs;
      
          const respuestadb = docs.map((doc) => ({
            id: doc.id,
            nombre: doc.data().nombre,
            latitud: doc.data().latitud,
            longitud: doc.data().longitud,
          }));
      
          return response.status(200).json(respuestadb);
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
        }
      })();
  })
    
  });
//ACTUALIZAR PUNTO
  exports.updatePunto = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    cors(request, response, () => {

      const extractor = request.params[0]
      // Le quita el / del inicio
      const id= extractor.split("/")[1]
      const {nombre, latitud, longitud} = request.body;
      (async () => {
          try {
            const document = db.collection("puntos").doc(id);
            await document.update({
              nombre: nombre,
              latitud: latitud,
              longitud: longitud,
            });
            return response.status(200).send({ ok: true, msg: "Punto actualizado correctamente" });
          } catch (error) {
            console.log(error);
            response.status(500).send({ ok: false, msg:"Hubo problemas para actualizar el punto" });
          }
      })();
    })
    // Extrae el id del path
    
  });
//ELIMINAR PUNTO
  exports.deletePunto = functions.https.onRequest( (request, response) => {
  
    cors(request, response, () => {
      //Funcion para eliminar un punto
        //   /adfasdfarf


      (async () => {
        const extractor = request.params[0]
        // Le quita el / del inicio
          const id= extractor.split("/")[1]
    
          try {
            const doc = db.collection("puntos").doc(id);
            await doc.delete();
            return response.status(200).send({ ok: true, msg: "Punto eliminado correctamente" });
          } catch (error) {
            console.log(error);
            response.status(500).send({ ok: false, msg:"Hubo problemas para eliminar el punto" });
          }
        })();
    })
    
    // Extrae el id del path
    
  });

//---------------------------------------------------------------------------------------------//
//CREAR  LUGARES
exports.newLugar = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  
  cors(request, response, () => {
    const {nombre, latitud, longitud, rango, tipo, disponibilidad, puntos, numeroDePuntos} = request.body;
    (async () => {
      try {
         await db.collection("lugares").doc().create({
           nombre: nombre,
           latitud: latitud,
           longitud: longitud,
           rango: rango,
           tipo: tipo,
           disponibilidad: disponibilidad,
           numeroDePuntos: numeroDePuntos,
  
         });
  
        await db.collection("lugares").where("nombre", "==", nombre)
          .get()
          .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              const {id} = doc
              addPuntosDeReferencia(id,puntos)
              return response.status(200).send({ ok: true, msg: "Lugar guardado correctamente", lugar: {id} });
          });
      })
        
        
      } catch (error) {
        console.log(error);
        response.status(500).send({ ok: false, msg:"Hubo problemas para guardar el punto" });
      }
    })();
  }) 
  
});

function addPuntosDeReferencia(id,arreglo) {
  arreglo.map((row) => {
    db.collection(`lugares/${id}/puntosDeReferencia`).doc(row.id).create({
      nombre: row.nombre,
      latitud: row.latitud,
      longitud: row.longitud,

    });
  })
}

//VER TODOS LOS LUGARES
exports.obtenerLugares = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  cors(request, response, () => {
    (async () => {
      try {
        let query = db.collection("lugares");
        const querySnapshot = await query.get();
        let docs = querySnapshot.docs;

        const respuestadb = docs.map((doc) =>
        (
              
            {id: doc.id,
              nombre: doc.data().nombre,
              latitud: doc.data().latitud,
              longitud: doc.data().longitud,
              rango: doc.data().rango,
              disponibilidad: doc.data().disponibilidad,
              tipo: doc.data().tipo,
              numeroDePuntos: doc.data().numeroDePuntos,
            }
         ));
        return response.status(200).json(respuestadb);          
      
      } catch (error) {
        console.log(error);
        response.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
      }
    })();
  }) 
  
});


//VER LUGAR POR ID
exports.obtenerLugarporId = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');  
  cors(request, response, () => {
    (async () => {
      // Extrae el id del path
      const extractor = request.params[0]
      // Le quita el / del inicio
      const id= extractor.split("/")[1]
      console.log(id);
        try {
          const lugares =  await db.collection("lugares").doc(id).get()
  
  
          let query = db.collection(`lugares/${id}/puntosDeReferencia`);
          const querySnapshot =await query.get();
          let docs =querySnapshot.docs;
          const referencias =[]
          docs.map(snapHijo=>{
                referencias.push({
                  id: snapHijo.id,
                  ...snapHijo.data()
                })
          })
  
          const respuestadb ={
            id: id,
            nombre: lugares.data().nombre,
            latitud: lugares.data().latitud,
            longitud: lugares.data().longitud,
            rango: lugares.data().rango,
            disponibilidad: lugares.data().disponibilidad,
            tipo: lugares.data().tipo,
            puntosDeReferencia: referencias,
          }
  
          return response.status(200).json(respuestadb);          
        
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
        }
      })();
  })
  
});


//BUSQUEDA POR NOMBRE
exports.buscarLugarPorNombre = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  cors(request, response, () => {
    (async () => {
      
      const extractor = request.params[0]
      // Le quita el / del inicio
      const nombre= extractor.split("/")[1]
        try {
          const lugaresObtenidos =[]
          db.collection("lugares").where("nombre", "==", nombre)
          .get()
          .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              lugaresObtenidos.push({
                id: doc.id,
                ...doc.data(),
                

              })

          });
          return response.status(200).json(lugaresObtenidos);
      })
          
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
        }
      })();
  })
});

//BUSQUEDA POR TIPO DE LUGAR
exports.buscarLugarPorTipo = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  cors(request, response, () => {
    (async () => {
      const extractor = request.params[0]
      // Le quita el / del inicio
      const tipo= extractor.split("/")[1]
  
        try {
          const lugaresObtenidos =[]
          db.collection("lugares").where("tipo", "==", tipo)
          .get()
          .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              lugaresObtenidos.push({
                id: doc.id,
                ...doc.data(),
                

              })
               
          });
          return response.status(200).json(lugaresObtenidos);
      })
        
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
        }
      })();
  })
});

//ACTUALIZAR LUGAR
exports.getPuntosDeReferenciaLugar = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  cors(request, response, () => {
    (async () => {
    // Extrae el id del path
    const extractor = request.params[0]
    // Le quita el / del inicio
    const id= extractor.split("/")[1]
       try {
        let query = db.collection(`lugares/${id}/puntosDeReferencia`);
        const querySnapshot = await query.get();
        let docs = querySnapshot.docs;
    
        const respuestadb = docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          latitud: doc.data().latitud,
          longitud: doc.data().longitud,
        }));
    
        return response.status(200).json(respuestadb);
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para obtener Los Puntos del Lugar" });
        }
      })();
    
  })
});

//ACTUALIZAR LUGAR
exports.updateLugar = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
  cors(request, response, () => {
    (async () => {
    // Extrae el id del path
    const extractor = request.params[0]
    // Le quita el / del inicio
    const id= extractor.split("/")[1]
    const document = db.collection("lugares").doc(id);
    const {nombre, latitud, longitud, rango, tipo, disponibilidad, puntos, numeroDePuntos} = request.body;
        try {
           deletePuntosDeReferencia(id);
           await document.update({
              nombre: nombre,
              latitud: latitud,
              longitud: longitud,
              rango: rango,
              tipo: tipo,
              disponibilidad: disponibilidad,
              numeroDePuntos: numeroDePuntos,
            });
  
           renovarPuntosDeReferencia(id,puntos)
        
          return response.status(200).send({ ok: true, msg:"Lugar actualizado con exito" });
        } catch (error) {
          console.log(error);
          response.status(500).send({ ok: false, msg:"Hubo problemas para actualizar el lugar" });
        }
      })();
    
  })
});

//TO DO 
function renovarPuntosDeReferencia(id,arreglo) {
  arreglo.map((row) => {
    db.collection(`lugares/${id}/puntosDeReferencia`).doc(row.id).set({
      nombre: row.nombre,
      latitud: row.latitud,
      longitud: row.longitud,
    });
  })
}


function deletePuntosDeReferencia(id) {
  (async () => {
    try {
      const doc = db.collection(`lugares/${id}/puntosDeReferencia`)
      const querySnapshot = await doc.get();
      let docs = querySnapshot.docs;

      docs.map((doc) => (
        db.collection(`lugares/${id}/puntosDeReferencia`).doc(doc.id).delete()
      ));
   
      
    } catch (error) {
      console.log(error);
    }

     
  })();
}

//ELIMINAR LUGAR
exports.deleteLugar = functions.https.onRequest( (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
     response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    cors(request, response, () => {
      (async () => {
        const extractor = request.params[0]
        // Le quita el / del inicio
        const id= extractor.split("/")[1]
        console.log(id);
        deletePuntosDeReferencia(id);
    
          try {
            const doc = db.collection("lugares").doc(id);
            await doc.delete();
            return response.status(200).send({ ok: true, msg: "Lugar eliminado correctamente" });
          } catch (error) {
            console.log(error);
            response.status(500).send({ ok: false, msg:"Hubo problemas para eliminar el lugar" });
          }
        })();
      
    })


  //Funcion para eliminar un punto
});
