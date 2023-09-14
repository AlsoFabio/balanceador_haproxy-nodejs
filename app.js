const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const { ps,nuevoContenedor, borrarAleatorio, agregarAlBalanceador } = require('./funciones');


app.use(express.json());
app.use(cors());

console.log(ps());

app.get('/ejecutar-borrar', (req, res) => {
  try {
    borrarAleatorio();
    agregarAlBalanceador()
  } catch (error) {
    console.log("no se puede borrar");
  }
});

app.get('/ejecutar-crear', (req, res) => {
  try {
    nuevoContenedor()
    agregarAlBalanceador()
  } catch (error) {
    console.log("xd");
  }
});

app.listen(port, () => {
  console.log(`Servidor Node.js ejecutándose en http://localhost:${port}`);
});
