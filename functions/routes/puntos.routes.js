
const { Router } = require("express");
const router = Router();

const admin = require("firebase-admin");
const db = admin.firestore();

//OBTENER PUNTOS
router.get("/puntos", async(req, res) => {

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
  
      return res.status(200).json(respuestadb);
    } catch (error) {
      console.log(error);
      res.status(500).send({ ok: false, msg:"Hubo problemas para ver el punto" });
    }

});
//CREAR PUNTO
router.post("/puntos", async (req, res) => {
  const {nombre, latitud, longitud} = req.body;
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

        return res.status(200).send({ ok: true, msg: "Punto guardado correctamente", punto: {id} });
        });
    
    })
  } catch (error) {
    console.log(error);
    response.status(500).send({ ok: false, msg:"Hubo problemas para guardar el punto" });
  }


});
//ACTUALIZAR PUNTO
router.put("/puntos/:id", async  (req, res) => {
    const {nombre, latitud, longitud} = req.body;
    const id =req.params.id
     try {
       const document = db.collection("puntos").doc(id);
       await document.update({
         nombre: nombre,
         latitud: latitud,
         longitud: longitud,
       });
       return res.status(200).send({ ok: true, msg: "Punto actualizado correctamente" });
     } catch (error) {
       console.log(error);
       res.status(500).send({ ok: false, msg:"Hubo problemas para actualizar el punto" });
     }
});

//ELIMINAR PUNTO
router.delete("/puntos/:id",async (req, res) => {
    const id =req.params.id
    try {
        const doc = db.collection("puntos").doc(id);
        await doc.delete();
        return res.status(200).send({ ok: true, msg: "Punto eliminado correctamente" });
      } catch (error) {
        console.log(error);
        res.status(500).send({ ok: false, msg:"Hubo problemas para eliminar el punto" });
      }
     
  });
  

module.exports = router;