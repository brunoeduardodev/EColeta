import express from "express";

const app = express();

app.get("/helloworld", (_, res) => {
  res.send("Deu certo!");
});

console.log("Iniciado");

app.listen(3333);
