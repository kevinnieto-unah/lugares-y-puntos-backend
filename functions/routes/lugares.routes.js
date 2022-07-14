
const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const db = admin.firestore();

//VER TODOS LOS LUGARES
router.get("/lugares",  async(req, res) => {
 
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
        return res.status(200).json(respuestadb);          
      
      } catch (error) {
        console.log(error);
        res.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
      }
      

  });
//OBTENER LUGAR ESPECIFICO
  router.get("/lugares/:lugar_id", async (req, res) => {
   
      try {
        const lugares =  await db.collection("lugares").doc(req.params.lugar_id).get()
  
  
        let query = db.collection(`lugares/${req.params.lugar_id}/puntosDeReferencia`);
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
          id: req.params.lugar_id,
          nombre: lugares.data().nombre,
          latitud: lugares.data().latitud,
          longitud: lugares.data().longitud,
          rango: lugares.data().rango,
          disponibilidad: lugares.data().disponibilidad,
          tipo: lugares.data().tipo,
          puntos: referencias,
        }
  
        return res.status(200).json(respuestadb);          
      
      } catch (error) {
        console.log(error);
        res.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
      }

  });

router.get("/Lugares/tipo/:tipo", async(req, res) => {
      try {
        const lugaresObtenidos =[]
        db.collection("lugares").where("tipo", "==", req.params.tipo)
        .get()
        .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            lugaresObtenidos.push({
              id: doc.id,
              ...doc.data(),
              
  
            })
             
        });
        return res.status(200).json(lugaresObtenidos);
    })
      
      } catch (error) {
        console.log(error);
        res.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
      }
  });  

  router.get("/lugares/puntos/:lugar_id", async(req, res) => {

      try {
       let query = db.collection(`lugares/${req.params.lugar_id}/puntosDeReferencia`);
       const querySnapshot = await query.get();
       let docs = querySnapshot.docs;
   
       const respuestadb = docs.map((doc) => ({
         id: doc.id,
         nombre: doc.data().nombre,
         latitud: doc.data().latitud,
         longitud: doc.data().longitud,
       }));
   
       return res.status(200).json(respuestadb);
       } catch (error) {
         console.log(error);
         res.status(500).send({ ok: false, msg:"Hubo problemas para obtener Los Puntos del Lugar" });
       }
      
  });
    
//CREAR  LUGARES
router.post("/lugares",async(req, res) => {
      const {nombre, latitud, longitud, rango, tipo, disponibilidad, puntos, numeroDePuntos} = req.body;
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
                return res.status(200).send({ ok: true, msg: "Lugar guardado correctamente", lugar: {id} });
            });
        })
          
          
        } catch (error) {
          console.log(error);
          res.status(500).send({ ok: false, msg:"Hubo problemas para guardar el punto" });
        }
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

router.put("/lugares/:lugar_id",async (req, res) => {
   
      const document = db.collection("lugares").doc(req.params.lugar_id);
      const {nombre, latitud, longitud, rango, tipo, disponibilidad, puntos, numeroDePuntos} = req.body;
          try {
             deletePuntosDeReferencia(req.params.lugar_id);
             await document.update({
                nombre: nombre,
                latitud: latitud,
                longitud: longitud,
                rango: rango,
                tipo: tipo,
                disponibilidad: disponibilidad,
                numeroDePuntos: numeroDePuntos,
              });
    
             renovarPuntosDeReferencia(req.params.lugar_id,puntos)
          
            return res.status(200).send({ ok: true, msg:"Lugar actualizado con exito" });
          } catch (error) {
            console.log(error);
            res.status(500).send({ ok: false, msg:"Hubo problemas para actualizar el lugar" });
          }
  

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
  router.delete("/lugares/:lugar_id", async(request, response) => {

      const id= request.params.lugar_id
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
  

    // Le quita el / del inicio
  });
  
  
  
  

module.exports = router;