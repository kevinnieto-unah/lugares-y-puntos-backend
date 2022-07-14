const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const cors = require("cors");

const app = express();

const serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lugares-y-puntos-118bd.firebaseio.com"
});

app.use(cors({ origin: true }));



app.use(require("./routes/puntos.routes"));
app.use(require("./routes/lugares.routes"));

exports.app = functions.https.onRequest(app);